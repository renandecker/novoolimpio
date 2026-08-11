package br.com.sol7.olimpio.basico.feriado.consumer;

import br.com.sol7.olimpio.basico.feriado.service.FeriadoAjusteService;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome o topico olimpio.schedule.feriado (publicado pelo microsservico schedule a 1h da manha)
 * e executa a regra de ajuste de feriados/oferecimentos (FeriadoAjusteService) numa virtual thread.
 */
@ApplicationScoped
public class FeriadoAjusteConsumer {

    private static final Logger LOG = Logger.getLogger(FeriadoAjusteConsumer.class);

    @Inject
    FeriadoAjusteService feriadoAjusteService;

    @Incoming("feriado-ajuste")
    @Blocking
    @RunOnVirtualThread
    public void processarFeriadoAjuste(String trigger) {
        LOG.infof("FeriadoAjusteConsumer - recebido trigger do schedule: %s", trigger);
        try {
            feriadoAjusteService.verificaFeriadosParaajustar().await().indefinitely();
            LOG.info("FeriadoAjusteConsumer - ajuste de feriados/oferecimentos concluido");
        } catch (Exception e) {
            LOG.error("FeriadoAjusteConsumer - falha ao ajustar feriados/oferecimentos", e);
        }
    }
}
