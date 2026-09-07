package br.com.sol7.olimpio.schedule.jobs;

import br.com.sol7.olimpio.schedule.pagamento.PagamentoConfirmadoEvent;
import br.com.sol7.olimpio.schedule.pagamento.PagamentoConfirmadoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome os eventos de pagamento confirmado publicados pelo fiserv-service (cartão)
 * e pelo asaas-service (PIX) no tópico {@code olimpio.pagamento.confirmado} e aplica
 * a baixa na parcela ({@code fin_parcela}) via {@link PagamentoConfirmadoService}.
 *
 * <p>Payload: JSON de {@code PagamentoConfirmadoEvent}
 * {idParcela, idTransacao, idPessoa, formaPagamento, status, valor, idGateway,
 * dataConfirmacao}.
 */
@ApplicationScoped
public class PagamentoConfirmadoConsumer {

    private static final Logger LOG = Logger.getLogger(PagamentoConfirmadoConsumer.class);

    @Inject
    PagamentoConfirmadoService pagamentoConfirmadoService;

    @Inject
    ObjectMapper objectMapper;

    @Incoming("pagamento-confirmado")
    public Uni<Void> processarPagamentoConfirmado(String payload) {
        LOG.infof("PagamentoConfirmadoConsumer - evento recebido: %s", payload);
        PagamentoConfirmadoEvent event;
        try {
            event = objectMapper.readValue(payload, PagamentoConfirmadoEvent.class);
        } catch (Exception e) {
            LOG.errorf(e, "PagamentoConfirmadoConsumer - payload invalido, ignorado: %s", payload);
            return Uni.createFrom().voidItem();
        }
        return pagamentoConfirmadoService.processar(event)
                .onFailure().recoverWithItem(e -> {
                    LOG.error("PagamentoConfirmadoConsumer - falha ao processar evento", e);
                    return null;
                });
    }
}
