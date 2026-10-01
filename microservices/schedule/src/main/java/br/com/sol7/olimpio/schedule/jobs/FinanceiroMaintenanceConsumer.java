package br.com.sol7.olimpio.schedule.jobs;

import br.com.sol7.olimpio.schedule.maintenance.FinanceiroMaintenanceService;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome o trigger manual da regra de negócio atualizarCobrancasAutomatico do
 * financeiro e executa a rotina.
 * Topico: olimpio.financeiro.atualizar-cobrancas (nome segue a regra de negócio).
 */
@ApplicationScoped
public class FinanceiroMaintenanceConsumer {

    private static final Logger LOG = Logger.getLogger(FinanceiroMaintenanceConsumer.class);

    @Inject
    FinanceiroMaintenanceService financeiro;

    @Incoming("financeiro-atualizar-cobrancas")
    @Blocking
    @RunOnVirtualThread
    public void processarAtualizarCobrancas(String trigger) {
        LOG.infof("FinanceiroMaintenanceConsumer - recebido trigger atualizarCobrancasAutomatico: %s", trigger);
        try {
            financeiro.atualizarCobrancasAutomatico().await().indefinitely();
            LOG.info("FinanceiroMaintenanceConsumer - atualizarCobrancasAutomatico concluido");
        } catch (Exception e) {
            LOG.error("FinanceiroMaintenanceConsumer - falha ao executar atualizarCobrancasAutomatico", e);
        }
    }
}
