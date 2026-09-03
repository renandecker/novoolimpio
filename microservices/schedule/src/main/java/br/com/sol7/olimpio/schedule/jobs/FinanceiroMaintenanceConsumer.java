package br.com.sol7.olimpio.schedule.jobs;

import br.com.sol7.olimpio.schedule.maintenance.FinanceiroMaintenanceService;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome triggers manuais do financeiro e executa as rotinas de manutencao de dominio:
 * atualizarCobrancasAutomatico.
 * Topico: olimpio.financeiro.maintenance
 */
@ApplicationScoped
public class FinanceiroMaintenanceConsumer {

    private static final Logger LOG = Logger.getLogger(FinanceiroMaintenanceConsumer.class);

    @Inject
    FinanceiroMaintenanceService financeiro;

    @Incoming("financeiro-maintenance")
    @Blocking
    @RunOnVirtualThread
    public void processarFinanceiroMaintenance(String action) {
        LOG.infof("FinanceiroMaintenanceConsumer - recebido trigger manual do financeiro: %s", action);
        try {
            switch (action) {
                case "atualizarCobrancasAutomatico" -> financeiro.atualizarCobrancasAutomatico().await().indefinitely();
                default -> {
                    LOG.warnf("FinanceiroMaintenanceConsumer - acao desconhecida: %s", action);
                    return;
                }
            }
            LOG.infof("FinanceiroMaintenanceConsumer - acao '%s' concluida", action);
        } catch (Exception e) {
            LOG.errorf(e, "FinanceiroMaintenanceConsumer - falha ao executar acao '%s'", action);
        }
    }
}
