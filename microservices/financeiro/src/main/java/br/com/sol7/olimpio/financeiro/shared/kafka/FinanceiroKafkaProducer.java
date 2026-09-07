package br.com.sol7.olimpio.financeiro.shared.kafka;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Publica triggers manuais no Kafka.
 * <ul>
 *   <li>Email de cobranca -> consumido pelo notificacoes-service (dono do dominio de e-mail);</li>
 *   <li>Fechamento de caixa e manutencao -> consumidos pelo schedule-service.</li>
 * </ul>
 */
@ApplicationScoped
public class FinanceiroKafkaProducer {

    @Inject
    @Channel("email-cobranca-manual-out")
    MutinyEmitter<String> emailCobrancaEmitter;

    @Inject
    @Channel("fechamento-caixa-manual-out")
    MutinyEmitter<String> fechamentoCaixaEmitter;

    @Inject
    @Channel("financeiro-atualizar-cobrancas-out")
    MutinyEmitter<String> atualizarCobrancasEmitter;

    public Uni<Void> enviarTriggerEmailCobranca(String payload) {
        Log.infof("FinanceiroKafkaProducer - enviando trigger email cobranca para o notificacoes: %s", payload);
        return emailCobrancaEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("FinanceiroKafkaProducer - falha ao enviar trigger email cobranca: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }

    public Uni<Void> enviarTriggerFechamentoCaixa(String payload) {
        Log.infof("FinanceiroKafkaProducer - enviando trigger fechamento caixa para o schedule: %s", payload);
        return fechamentoCaixaEmitter.send(payload)
                .onFailure().invoke(err -> Log.warnf("FinanceiroKafkaProducer - falha ao enviar trigger fechamento caixa: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }

    /**
     * Envia o trigger da regra de negocio atualizarCobrancasAutomatico para o schedule,
     * no topico dedicado {@code olimpio.financeiro.atualizar-cobrancas}.
     */
    public Uni<Void> enviarTriggerAtualizarCobrancas(String action) {
        Log.infof("FinanceiroKafkaProducer - enviando trigger atualizarCobrancas para o schedule: %s", action);
        return atualizarCobrancasEmitter.send(action)
                .onFailure().invoke(err -> Log.warnf("FinanceiroKafkaProducer - falha ao enviar trigger atualizarCobrancas: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}

