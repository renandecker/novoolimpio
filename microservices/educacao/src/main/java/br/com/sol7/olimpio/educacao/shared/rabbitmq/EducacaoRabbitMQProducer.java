package br.com.sol7.olimpio.educacao.shared.rabbitmq;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Publica triggers manuais no RabbitMQ.
 * <ul>
 *   <li>Email NAP -> consumido pelo notificacoes-service (dono do dominio de e-mail);</li>
 *   <li>Manutencao -> um exchange por regra de negocio, todos consumidos pelo schedule-service:
 *       {@code olimpio.educacao.corrigir-avaliacoes},
 *       {@code olimpio.educacao.carregar-chamadas-pendentes} e
 *       {@code olimpio.educacao.remover-extratores-antigos}.</li>
 * </ul>
 */
@ApplicationScoped
public class EducacaoRabbitMQProducer {

    @Inject
    @Channel("email-nap-manual-out")
    MutinyEmitter<String> emailNapEmitter;

    @Inject
    @Channel("corrigir-avaliacoes-out")
    MutinyEmitter<String> corrigirAvaliacoesEmitter;

    @Inject
    @Channel("carregar-chamadas-out")
    MutinyEmitter<String> carregarChamadasEmitter;

    @Inject
    @Channel("remover-extratores-out")
    MutinyEmitter<String> removerExtratoresEmitter;

    public Uni<Void> enviarTriggerEmailNap(String payload) {
        Log.infof("EducacaoRabbitMQProducer - enviando trigger email NAP para o notificacoes: %s", payload);
        return emailNapEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("EducacaoRabbitMQProducer - falha ao enviar trigger email NAP: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }

    /**
     * Envia o trigger da regra corrigirAvaliacoes para o schedule.
     */
    public Uni<Void> enviarTriggerCorrigirAvaliacoes(String payload) {
        Log.infof("EducacaoRabbitMQProducer - enviando trigger corrigirAvaliacoes para o schedule: %s", payload);
        return corrigirAvaliacoesEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("EducacaoRabbitMQProducer - falha ao enviar trigger corrigirAvaliacoes: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }

    /**
     * Envia o trigger da regra carregarChamadasPendentes para o schedule.
     */
    public Uni<Void> enviarTriggerCarregarChamadasPendentes(String payload) {
        Log.infof("EducacaoRabbitMQProducer - enviando trigger carregarChamadasPendentes para o schedule: %s", payload);
        return carregarChamadasEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("EducacaoRabbitMQProducer - falha ao enviar trigger carregarChamadasPendentes: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }

    /**
     * Envia o trigger da regra removerExtratoresAntigos para o schedule.
     */
    public Uni<Void> enviarTriggerRemoverExtratoresAntigos(String payload) {
        Log.infof("EducacaoRabbitMQProducer - enviando trigger removerExtratoresAntigos para o schedule: %s", payload);
        return removerExtratoresEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("EducacaoRabbitMQProducer - falha ao enviar trigger removerExtratoresAntigos: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}