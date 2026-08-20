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
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Gera e consulta cobrancas PIX, reaproveitando fin_parcela_pix (tabela legada) e vinculando o
 * resultado a fin_parcela.id_parcela_pix. A geracao efetiva do QR Code/chave e delegada a
 * PixProviderClient. Fluxo movido do fiserv para o asaas-service.
 */
@ApplicationScoped
public class PixService {

    @Inject
    ParcelaPixRepository parcelaPixRepository;
    @Inject
    ParcelaRepository parcelaRepository;
    @Inject
    PixProviderClient provider;
    @Inject
    PagamentoConfirmadoProducer pagamentoConfirmadoProducer;

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
}
