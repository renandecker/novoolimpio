package br.com.sol7.olimpio.financeiro.shared.kafka;

import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Publica triggers manuais no Kafka para o microsservico schedule.
 * Usado quando o financeiro dispara manualmente email de cobranca ou fechamento de caixa.
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
    @Channel("financeiro-maintenance-out")
    MutinyEmitter<String> maintenanceEmitter;

    public Uni<Void> enviarTriggerEmailCobranca(String payload) {
        Log.infof("FinanceiroKafkaProducer - enviando trigger email cobranca para o schedule: %s", payload);
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

    public Uni<Void> enviarTriggerManutencao(String action) {
        Log.infof("FinanceiroKafkaProducer - enviando trigger manutencao para o schedule: %s", action);
        return maintenanceEmitter.send(action)
                .onFailure().invoke(err -> Log.warnf("FinanceiroKafkaProducer - falha ao enviar trigger manutencao: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}

