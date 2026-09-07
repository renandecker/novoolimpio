package br.com.sol7.olimpio.notificacoes.notificacao.emailmanual;

import br.com.sol7.olimpio.notificacoes.notificacao.service.CanalEmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Consome os triggers manuais de e-mail vindos do financeiro (cobrança) e do
 * educacao (NAP) — tópicos {@code olimpio.financeiro.email-manual} e
 * {@code olimpio.educacao.email-manual}.
 *
 * <p>Migrado do schedule-service: e-mail é responsabilidade do notificacoes-service.
 *
 * <p>O tópico {@code olimpio.financeiro.email-manual} carrega dois tipos de mensagem
 * (envelope com campo {@code tipo}):
 * <ul>
 *   <li>{@code FECHAMENTO_CAIXA} — e-mail transacional de um caixa fechado pelo
 *       schedule-service (destinatário/assunto/corpoHtml na mensagem); entregue
 *       direto via SMTP;</li>
 *   <li>qualquer outro conteúdo (trigger de rotina) — executa
 *       {@code rotinaEmailCobranca()}, que gera os envios pendentes em
 *       {@code fin_cobranca_email}.</li>
 * </ul>
 */
@ApplicationScoped
public class EmailManualConsumer {

    private static final Logger LOG = LoggerFactory.getLogger(EmailManualConsumer.class);

    private static final String TIPO_FECHAMENTO_CAIXA = "FECHAMENTO_CAIXA";

    @Inject
    CobrancaEmailMaintenanceService cobrancaEmail;

    @Inject
    NapEmailMaintenanceService napEmail;

    @Inject
    CanalEmailService canalEmailService;

    @Inject
    ObjectMapper objectMapper;

    @Incoming("email-cobranca-manual")
    public Uni<Void> processarEmailCobrancaManual(String payload) {
        Uni<Void> fechamento = tentarEntregarFechamentoCaixa(payload);
        if (fechamento != null) {
            return fechamento;
        }
        LOG.info("EmailManualConsumer - recebido trigger email cobranca manual: {}", payload);
        return cobrancaEmail.rotinaEmailCobranca()
                .invoke(resumo -> LOG.info("EmailManualConsumer - rotina email cobranca concluida: {} configuracao(es), {} destinatario(s)",
                        resumo.configuracoes(), resumo.destinatarios()))
                .onFailure().invoke(e -> LOG.error("EmailManualConsumer - falha ao processar email cobranca", e))
                .onFailure().recoverWithNull()
                .replaceWithVoid();
    }

    /**
     * Se o payload for o envelope de fechamento de caixa do schedule, entrega o
     * e-mail direto via SMTP e retorna o Uni; caso contrário retorna null para que
     * o chamador siga o fluxo de rotina.
     */
    private Uni<Void> tentarEntregarFechamentoCaixa(String payload) {
        JsonNode node;
        try {
            node = objectMapper.readTree(payload);
        } catch (Exception e) {
            return null;
        }
        if (!TIPO_FECHAMENTO_CAIXA.equals(texto(node, "tipo"))) {
            return null;
        }
        String destinatario = texto(node, "destinatario");
        String assunto = texto(node, "assunto");
        String corpoHtml = texto(node, "corpoHtml");
        LOG.info("EmailManualConsumer - recebido e-mail de fechamento de caixa {} para {}",
                texto(node, "caixaId"), destinatario);
        return canalEmailService.enviarDireto(destinatario, assunto, corpoHtml)
                .onFailure().invoke(e -> LOG.error("EmailManualConsumer - falha ao entregar e-mail de fechamento de caixa", e))
                .onFailure().recoverWithNull()
                .replaceWithVoid();
    }

    private static String texto(JsonNode node, String campo) {
        JsonNode v = node.get(campo);
        return v == null || v.isNull() ? null : v.asText(null);
    }

    @Incoming("email-nap-manual")
    public Uni<Void> processarEmailNapManual(String payload) {
        LOG.info("EmailManualConsumer - recebido trigger email NAP manual: {}", payload);
        return napEmail.rotinaEmailNap()
                .invoke(resumo -> LOG.info("EmailManualConsumer - rotina email NAP concluida: {} configuracao(es), {} destinatario(s)",
                        resumo.configuracoes(), resumo.destinatarios()))
                .onFailure().invoke(e -> LOG.error("EmailManualConsumer - falha ao processar email NAP", e))
                .onFailure().recoverWithNull()
                .replaceWithVoid();
    }
}
