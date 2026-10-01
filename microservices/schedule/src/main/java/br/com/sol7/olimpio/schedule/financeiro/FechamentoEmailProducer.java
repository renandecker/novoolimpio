package br.com.sol7.olimpio.schedule.financeiro;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.jboss.logging.Logger;

/**
 * Publica o e-mail de cada caixa fechado no tópico
 * {@code olimpio.financeiro.email-manual} (canal "fechamento-email-out").
 * A entrega é feita pelo notificacoes-service.
 */
@ApplicationScoped
public class FechamentoEmailProducer {

    private static final Logger LOG = Logger.getLogger(FechamentoEmailProducer.class);

    @Inject
    @Channel("fechamento-email-out")
    MutinyEmitter<String> emitter;

    @Inject
    ObjectMapper objectMapper;

    public Uni<Void> publicar(FechamentoCaixaEmailEvent event) {
        String json;
        try {
            json = objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            LOG.errorf(e, "FechamentoEmailProducer - falha ao serializar e-mail do caixa %d", event.caixaId());
            return Uni.createFrom().voidItem();
        }
        LOG.infof("FechamentoEmailProducer - publicando e-mail do caixa %d para %s",
                event.caixaId(), event.destinatario());
        return emitter.send(json)
                .onFailure().invoke(err -> LOG.warnf(
                        "FechamentoEmailProducer - falha ao publicar e-mail do caixa %d: %s",
                        event.caixaId(), err.getMessage()))
                .onFailure().recoverWithNull();
    }
}
