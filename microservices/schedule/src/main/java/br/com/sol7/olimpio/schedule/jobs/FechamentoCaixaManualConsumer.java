package br.com.sol7.olimpio.schedule.jobs;

import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome trigger de fechamento de caixa manual vindo do financeiro.
 * Topico: olimpio.financeiro.fechamento-manual
 */
@ApplicationScoped
public class FechamentoCaixaManualConsumer {

    private static final Logger LOG = Logger.getLogger(FechamentoCaixaManualConsumer.class);

    @Inject
    br.com.sol7.olimpio.schedule.maintenance.FinanceiroMaintenanceService financeiro;

    @Incoming("fechamento-caixa-manual")
    @Blocking
    @RunOnVirtualThread
    public void processarFechamentoCaixaManual(String payload) {
        LOG.infof("FechamentoCaixaManualConsumer - recebido trigger fechamento caixa manual: %s", payload);
        try {
            financeiro.fechamentoCaixaAbertos().await().indefinitely();
            LOG.info("FechamentoCaixaManualConsumer - fechamento de caixa concluido");
        } catch (Exception e) {
            LOG.error("FechamentoCaixaManualConsumer - falha ao fechar caixas", e);
        }
    }
}
