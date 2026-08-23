package br.com.sol7.olimpio.asaas.pagamento_pix.service;

import br.com.sol7.olimpio.asaas.pagamento_pix.dto.GerarCobrancaPixRequest;
import br.com.sol7.olimpio.asaas.pagamento_pix.dto.ParcelaPixResponse;
import br.com.sol7.olimpio.asaas.pagamento_pix.entity.Parcela;
import br.com.sol7.olimpio.asaas.pagamento_pix.entity.ParcelaPix;
import br.com.sol7.olimpio.asaas.pagamento_pix.event.PagamentoConfirmadoEvent;
import br.com.sol7.olimpio.asaas.pagamento_pix.event.PagamentoConfirmadoProducer;
import br.com.sol7.olimpio.asaas.pagamento_pix.provider.PixProviderClient;
import br.com.sol7.olimpio.asaas.pagamento_pix.repository.ParcelaPixRepository;
import br.com.sol7.olimpio.asaas.pagamento_pix.repository.ParcelaRepository;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import io.vertx.core.Vertx;
import io.vertx.ext.mail.MailClient;
import io.vertx.ext.mail.MailConfig;
import io.vertx.ext.mail.MailMessage;
import io.vertx.ext.mail.StartTLSOptions;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Gera e consulta cobrancas PIX, reaproveitando fin_parcela_pix (tabela legada) e vinculando o
 * resultado a fin_parcela.id_parcela_pix. A geracao efetiva do QR Code/chave e delegada a
 * PixProviderClient. Fluxo movido do fiserv para o asaas-service.
 */
@ApplicationScoped
public class PixService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PixService.class);

    @Inject
    ParcelaPixRepository parcelaPixRepository;
    @Inject
    ParcelaRepository parcelaRepository;
    @Inject
    PixProviderClient provider;
    @Inject
    PagamentoConfirmadoProducer pagamentoConfirmadoProducer;
    @Inject
    Vertx vertx;

    @ConfigProperty(name = "quarkus.mailer.from", defaultValue = "")
    String mailFrom;

    @WithTransaction
    public Uni<ParcelaPixResponse> gerarCobranca(GerarCobrancaPixRequest r) {
        return parcelaRepository.findById(r.idParcela())
                .onItem().ifNull().failWith(() -> new NotFoundException("Parcela nao encontrada"))
                .onItem().transformToUni(parcela -> provider.criarCobranca(
                        String.valueOf(r.idPessoa()), "Parcela " + r.idParcela(), r.valor(), r.dataVencimento())
                        .onItem().transformToUni(charge -> {
                            var pix = new ParcelaPix();
                            pix.qrcode = charge.qrcode();
                            pix.chave = charge.chave();
                            pix.situacao = charge.situacao();
                            pix.dataVencimento = r.dataVencimento();
                            pix.valor = r.valor();
                            pix.providerChargeId = charge.chargeId();
                            pix.dataCriacao = LocalDateTime.now();
                            pix.ativo = true;

                            return parcelaPixRepository.persist(pix)
                                    .onItem().transformToUni(persisted -> {
                                        parcela.idParcelaPix = pix.id;
                                        parcela.formaPagamento = "PIX";
                                        return parcelaRepository.persist(parcela).map(v -> toResponse(pix));
                                    });
                        }));
    }

    @WithSession
    public Uni<ParcelaPixResponse> consultar(Long id) {
        return parcelaPixRepository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Cobranca PIX nao encontrada"))
                .map(this::toResponse);
    }

    /**
     * Consulta o status atual junto ao provider (PSP) e atualiza situacao/valorPago/endToEndId localmente.
     */
    @WithTransaction
    public Uni<ParcelaPixResponse> atualizarStatus(Long id) {
        return parcelaPixRepository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Cobranca PIX nao encontrada"))
                .onItem().transformToUni(pix -> provider.consultarStatus(
                        pix.providerChargeId != null ? pix.providerChargeId : String.valueOf(pix.id))
                        .invoke(status -> {
                            pix.situacao = status.situacao();
                            if (status.valorPago() != null) {
                                pix.valorPago = status.valorPago();
                            }
                            if (status.endToEndId() != null) {
                                pix.endToEndId = status.endToEndId();
                                pix.dataPagamento = LocalDateTime.now();
                            }
                        })
                        .map(status -> pix))
                .onItem().transformToUni(pix -> {
                    ParcelaPixResponse response = toResponse(pix);
                    if (!isPago(pix.situacao)) {
                        return Uni.createFrom().item(response);
                    }
                    return parcelaRepository.find("idParcelaPix", pix.id).firstResult()
                            .onItem().transformToUni(parcela -> {
                                if (parcela == null) {
                                    return Uni.createFrom().item(response);
                                }
                                return pagamentoConfirmadoProducer.publicar(new PagamentoConfirmadoEvent(
                                        parcela.id, pix.id, parcela.idPessoa, "PIX", pix.situacao,
                                        pix.valorPago != null ? pix.valorPago : pix.valor, pix.providerChargeId,
                                        pix.dataPagamento)).map(ignored -> response);
                            });
                });
    }

    private boolean isPago(String situacao) {
        return situacao != null && Set.of("PAGO", "RECEIVED", "CONFIRMED").contains(situacao.toUpperCase());
    }

    private ParcelaPixResponse toResponse(ParcelaPix p) {
        return new ParcelaPixResponse(p.id, p.qrcode, p.chave, p.situacao, p.valor, p.valorPago,
                p.providerChargeId, p.endToEndId, p.dataVencimento, p.dataCriacao, p.dataPagamento);
    }

    @WithSession
    public Uni<ParcelaPixResponse> consultarPorParcela(Long idParcela) {
        return parcelaRepository.findById(idParcela)
                .onItem().ifNull().failWith(() -> new NotFoundException("Parcela nao encontrada"))
                .onItem().transformToUni(parcela -> {
                    if (parcela.idParcelaPix == null) {
                        return Uni.createFrom().failure(new NotFoundException("PIX nao gerado para esta parcela"));
                    }
                    return parcelaPixRepository.findById(parcela.idParcelaPix)
                            .onItem().ifNull().failWith(() -> new NotFoundException("Cobranca PIX nao encontrada"))
                            .map(this::toResponse);
                });
    }

    @WithTransaction
    public Uni<Void> enviarEmailPix(Long idParcela, Long idPessoa, String qrcode, String chave) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT p.email
                        FROM bas_pessoa p
                        WHERE p.id = ?1
                        """)
                        .setParameter(1, idPessoa)
                        .getResultList())
                .onItem().transformToUni(emails -> {
                    if (emails.isEmpty() || emails.get(0) == null) {
                        return Uni.createFrom().failure(new IllegalStateException("E-mail do aluno não encontrado"));
                    }
                    String destinatario = emails.get(0).toString().trim();
                    return enviarEmail(destinatario, idParcela, qrcode, chave);
                });
    }

    private Uni<Void> enviarEmail(String destinatario, Long idParcela, String qrcode, String chave) {
        return configSmtp()
                .chain(config -> {
                    if (config == null || config.host() == null || config.host().isBlank()) {
                        LOGGER.warn("Sem configuração de e-mail (bas_email). PIX não enviado por e-mail.");
                        return Uni.createFrom().failure(new IllegalStateException("Configuração de e-mail não encontrada"));
                    }
                    return send(config, destinatario, "QR Code PIX - Parcela " + idParcela, buildEmailBody(idParcela, qrcode, chave))
                            .onFailure().invoke(err ->
                                    LOGGER.warn("Falha ao enviar e-mail do PIX para '{}': {}", destinatario, err.getMessage()))
                            .replaceWithVoid();
                });
    }

    private record ConfigSmtp(String host, Integer port, String username, String password, Boolean tls, Boolean ssl) {}

    private Uni<ConfigSmtp> configSmtp() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "SELECT host, port, username, password, tls, ssl FROM bas_email WHERE fl_principal = true LIMIT 1")
                        .getResultList())
                .chain(list -> {
                    if (!list.isEmpty()) return Uni.createFrom().item(toConfigSmtp(list.get(0)));
                    return Panache.getSession()
                            .chain(session -> session.createNativeQuery(
                                    "SELECT host, port, username, password, tls, ssl FROM bas_email ORDER BY id ASC LIMIT 1")
                                    .getResultList())
                            .map(rows -> rows.isEmpty() ? null : toConfigSmtp(rows.get(0)));
                });
    }

    private ConfigSmtp toConfigSmtp(Object row) {
        Object[] cols = (Object[]) row;
        return new ConfigSmtp(
                cols[0] == null ? null : cols[0].toString(),
                cols[1] == null ? null : ((Number) cols[1]).intValue(),
                cols[2] == null ? null : cols[2].toString(),
                cols[3] == null ? null : cols[3].toString(),
                cols[4] == null ? null : (Boolean) cols[4],
                cols[5] == null ? null : (Boolean) cols[5]);
    }

    private String buildEmailBody(Long idParcela, String qrcode, String chave) {
        StringBuilder sb = new StringBuilder();
        sb.append("Olá,\n\n");
        sb.append("Segue o QR Code e código PIX para pagamento da parcela ").append(idParcela).append(":\n\n");
        sb.append("Código PIX (Copia e Cola):\n").append(chave).append("\n\n");
        if (qrcode != null && !qrcode.isEmpty()) {
            sb.append("QR Code em anexo (base64): ").append(qrcode.substring(0, Math.min(50, qrcode.length()))).append("...\n");
        }
        sb.append("\nAtenciosamente,\nEquipe Olímpio");
        return sb.toString();
    }

    private Uni<io.vertx.ext.mail.MailResult> send(ConfigSmtp config, String to, String subject, String body) {
        MailConfig mailConfig = new MailConfig();
        mailConfig.setHostname(config.host());
        mailConfig.setPort(config.port() != null && config.port() > 0 ? config.port() : 587);
        mailConfig.setUsername(config.username());
        mailConfig.setPassword(config.password());
        if (Boolean.TRUE.equals(config.ssl())) {
            mailConfig.setSsl(true);
            mailConfig.setStarttls(StartTLSOptions.DISABLED);
        } else {
            mailConfig.setStarttls(Boolean.TRUE.equals(config.tls()) ? StartTLSOptions.OPTIONAL : StartTLSOptions.DISABLED);
        }

        String from = mailFrom != null && !mailFrom.isBlank() ? mailFrom : config.username();

        MailMessage message = new MailMessage()
                .setFrom(from)
                .setTo(to)
                .setSubject(subject)
                .setText(body);

        MailClient client = MailClient.create(vertx, mailConfig);
        return Uni.createFrom().completionStage(client.sendMail(message).toCompletionStage())
                .onTermination().invoke(client::close);
    }
}
