package br.com.sol7.olimpio.educacao.shared.kafka;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Publica triggers manuais no Kafka para o microsservico schedule.
 * Usado quando o educacao dispara manualmente email NAP.
 */
@ApplicationScoped
public class EducacaoKafkaProducer {

    @Inject
    @Channel("email-nap-manual-out")
    MutinyEmitter<String> emailNapEmitter;

    @Inject
    @Channel("educacao-maintenance-out")
    MutinyEmitter<String> maintenanceEmitter;

    public Uni<Void> enviarTriggerEmailNap(String payload) {
        Log.infof("EducacaoKafkaProducer - enviando trigger email NAP para o schedule: %s", payload);
        return emailNapEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("EducacaoKafkaProducer - falha ao enviar trigger email NAP: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }

    /**
     * Envia um trigger de manutencao do dominio educacao para o schedule.
     * Acoes suportadas: corrigirAvaliacoes, carregarChamadasPendentes, removerExtratoresAntigos
     */
    public Uni<Void> enviarTriggerManutencao(String action) {
        Log.infof("EducacaoKafkaProducer - enviando trigger manutencao para o schedule: %s", action);
        return maintenanceEmitter.send(action)
                .onFailure().invoke(err -> Log.warnf("EducacaoKafkaProducer - falha ao enviar trigger manutencao: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}

