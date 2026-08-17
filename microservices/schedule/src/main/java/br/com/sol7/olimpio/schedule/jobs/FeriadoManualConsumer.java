package br.com.sol7.olimpio.schedule.jobs;

import br.com.sol7.olimpio.schedule.maintenance.FeriadoAjusteMaintenanceService;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome triggers do basico (manual) e executa a regra de ajuste de feriados/oferecimentos.
 * Topico: olimpio.basico.feriado-manual
 */
@ApplicationScoped
public class FeriadoManualConsumer {

    private static final Logger LOG = Logger.getLogger(FeriadoManualConsumer.class);

    @Inject
    FeriadoAjusteMaintenanceService feriadoAjuste;

    @Incoming("feriado-manual")
    @Blocking
    @RunOnVirtualThread
    public void processarFeriadoManual(String trigger) {
        LOG.infof("FeriadoManualConsumer - recebido trigger manual do basico: %s", trigger);
        try {
            if ("executarAjusteSelecionados".equals(trigger)) {
                feriadoAjuste.executarAjusteSelecionados().await().indefinitely();
            } else if ("executarAjusteNaoSelecionados".equals(trigger)) {
                feriadoAjuste.executarAjusteNaoSelecionados().await().indefinitely();
            } else {
                feriadoAjuste.verificaFeriadosParaajustar().await().indefinitely();
            }
            LOG.info("FeriadoManualConsumer - ajuste de feriados/oferecimentos concluido");
        } catch (Exception e) {
            LOG.error("FeriadoManualConsumer - falha ao ajustar feriados/oferecimentos", e);
        }
    }
}
