package br.com.sol7.olimpio.pagamento.gateway.fiserv.webhook;

import br.com.sol7.olimpio.pagamento.pagamento.event.PagamentoConfirmadoEvent;
import br.com.sol7.olimpio.pagamento.pagamento.event.PagamentoConfirmadoProducer;
import br.com.sol7.olimpio.pagamento.parcela.entity.Parcela;
import br.com.sol7.olimpio.pagamento.parcela.repository.ParcelaRepository;
import br.com.sol7.olimpio.pagamento.parcelacartao.entity.ParcelaCartao;
import br.com.sol7.olimpio.pagamento.parcelacartao.repository.ParcelaCartaoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Processa as confirmacoes assincronas (webhook) enviadas pela Fiserv Commerce Hub para o
 * endpoint /api/pagamento/webhook/fiserv. O payload e polimorfico; os campos mais relevantes
 * (ipgTransactionId, orderId, merchantTransactionId, transactionStatus/transactionResult) sao
 * extraidos de forma tolerante. Idempotente: repetir o mesmo webhook apenas reaplica o status.
 */
@ApplicationScoped
public class FiservWebhookService {

    private static final Set<String> STATUS_APROVADO = Set.of("APPROVED", "SUCCESS", "SETTLED", "AUTHORIZED", "CAPTURED");
    private static final Set<String> STATUS_REVERSO = Set.of("VOIDED", "RETURNED", "REVERSED", "CANCELADO", "ESTORNADO");

    @Inject
    ParcelaCartaoRepository repository;
    @Inject
    ParcelaRepository parcelaRepository;
    @Inject
    PagamentoConfirmadoProducer pagamentoConfirmadoProducer;

    @WithTransaction
    public Uni<Void> processar(JsonNode payload) {
        String statusRecebido = texto(payload, "transactionStatus");
        if (statusRecebido == null) statusRecebido = texto(payload, "transactionResult");
        String ipg = texto(payload, "ipgTransactionId");
        if (ipg == null) ipg = texto(payload, "ipgTransactionDetails.ipgTransactionId");

        final String statusFinal = statusRecebido;
        final String ipgFinal = ipg;
        if (ipgFinal == null && statusFinal == null) {
            return Uni.createFrom().voidItem();
        }
        String merchant = texto(payload, "merchantTransactionId");
        String order = texto(payload, "orderId");

        return buscarTransacao(ipgFinal, merchant, order)
                .onItem().transformToUni(entity -> {
                    if (entity == null || statusFinal == null) {
                        return Uni.createFrom().voidItem();
                    }
                    entity.status = statusFinal.toUpperCase();
                    String mensagem = texto(payload, "error.message");
                    if (mensagem != null) {
                        entity.mensagemRetorno = mensagem;
                    }
                    if (STATUS_REVERSO.contains(entity.status)) {
                        entity.dataCancelamento = LocalDateTime.now();
                    }
                    return repository.persist(entity).onItem().transformToUni(v ->
                            atualizarParcela(entity));
                });
    }

    private Uni<ParcelaCartao> buscarTransacao(String ipg, String merchant, String order) {
        if (ipg != null) {
            return repository.find("ipgTransactionId", ipg).firstResult();
        }
        if (merchant != null) {
            return repository.find("merchantTransactionId", merchant).firstResult();
        }
        if (order != null) {
            return repository.find("orderId", order).firstResult();
        }
        return Uni.createFrom().nullItem();
    }

    private Uni<Void> atualizarParcela(ParcelaCartao entity) {
        return parcelaRepository.find("idParcelaCartao", entity.id).firstResult()
                .onItem().transformToUni(parcela -> {
                    if (parcela == null) {
                        return Uni.createFrom().voidItem();
                    }
                    if (STATUS_APROVADO.contains(entity.status)) {
                        if (parcela.dataPagamento == null) {
                            parcela.dataPagamento = LocalDateTime.now();
                        }
                        return parcelaRepository.persist(parcela)
                                .onItem().transformToUni(p -> publicarConfirmado(parcela, entity))
                                .replaceWithVoid();
                    }
                    if (STATUS_REVERSO.contains(entity.status)) {
                        parcela.dataPagamento = null;
                        return parcelaRepository.persist(parcela).replaceWithVoid();
                    }
                    return Uni.createFrom().voidItem();
                });
    }

    private Uni<Void> publicarConfirmado(Parcela parcela, ParcelaCartao entity) {
        return pagamentoConfirmadoProducer.publicar(new PagamentoConfirmadoEvent(
                parcela.id, entity.id, parcela.idPessoa, parcela.formaPagamento, entity.status,
                entity.valor, entity.ipgTransactionId != null ? entity.ipgTransactionId : entity.orderId,
                entity.dataTransacao));
    }

    private String texto(JsonNode node, String path) {
        return node.at("/" + path.replace('.', '/')).asText(null);
    }
}
