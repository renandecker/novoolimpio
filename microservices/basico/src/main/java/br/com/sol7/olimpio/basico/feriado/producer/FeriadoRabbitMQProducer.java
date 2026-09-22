package br.com.sol7.olimpio.basico.feriado.producer;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Publica triggers de ajuste de feriados no RabbitMQ para o microsservico schedule.
 * Quando o basico dispara manualmente (API), envia o trigger aqui e o schedule
 * executa a regra de ajuste.
 */
@ApplicationScoped
public class FeriadoRabbitMQProducer {

    @Inject
    @Channel("feriado-manual-out")
    MutinyEmitter<String> emitter;

    public Uni<Void> enviarTrigger(String action) {
        Log.infof("FeriadoRabbitMQProducer - enviando trigger '%s' para o schedule", action);
        return emitter.send(action)
                .onFailure().invoke(err -> Log.warnf("FeriadoRabbitMQProducer - falha ao enviar trigger: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}