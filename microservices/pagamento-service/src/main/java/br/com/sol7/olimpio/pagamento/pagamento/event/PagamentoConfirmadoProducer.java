package br.com.sol7.olimpio.pagamento.pagamento.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Publica eventos de pagamento confirmado no Kafka (topico olimpio.pagamento.confirmado,
 * configurado em application.properties - canal "pagamento-confirmado"). Segue o mesmo
 * padrao do NotificacaoKafkaProducer do notificacoes-service: JSON serializado com
 * StringSerializer e falha de publicacao apenas logada (nao derruba a transacao).
 */
@ApplicationScoped
public class PagamentoConfirmadoProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(PagamentoConfirmadoProducer.class);

    @Inject
    @Channel("pagamento-confirmado")
    MutinyEmitter<String> emitter;

    @Inject
    ObjectMapper objectMapper;

    public Uni<Void> publicar(PagamentoConfirmadoEvent event) {
        String json;
        try {
            json = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException ex) {
            LOGGER.error("Falha ao serializar evento de pagamento confirmado: {}", event, ex);
            return Uni.createFrom().voidItem();
        }
        return emitter.send(json)
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao publicar evento de pagamento confirmado no Kafka: {}", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}
