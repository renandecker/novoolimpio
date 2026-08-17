package br.com.sol7.olimpio.schedule.jobs;

import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome triggers de email manual vindos do financeiro (cobranca) e educacao (NAP).
 * Topicos: olimpio.financeiro.email-manual, olimpio.educacao.email-manual
 * Payload: JSON com {etapaId, mensagemId, contratoIds[], tipo}
 */
@ApplicationScoped
public class EmailManualConsumer {

    private static final Logger LOG = Logger.getLogger(EmailManualConsumer.class);

    @Inject
    br.com.sol7.olimpio.schedule.maintenance.CobrancaEmailMaintenanceService cobrancaEmail;

    @Inject
    br.com.sol7.olimpio.schedule.maintenance.NapEmailMaintenanceService napEmail;

    @Incoming("email-cobranca-manual")
    @Blocking
    @RunOnVirtualThread
    public void processarEmailCobrancaManual(String payload) {
        LOG.infof("EmailManualConsumer - recebido trigger email cobranca manual: %s", payload);
        try {
            cobrancaEmail.rotinaEmailCobranca().await().indefinitely();
            LOG.info("EmailManualConsumer - rotina email cobranca concluida");
        } catch (Exception e) {
            LOG.error("EmailManualConsumer - falha ao processar email cobranca", e);
        }
    }

    @Incoming("email-nap-manual")
    @Blocking
    @RunOnVirtualThread
    public void processarEmailNapManual(String payload) {
        LOG.infof("EmailManualConsumer - recebido trigger email NAP manual: %s", payload);
        try {
            napEmail.rotinaEmailNap().await().indefinitely();
            LOG.info("EmailManualConsumer - rotina email NAP concluida");
        } catch (Exception e) {
            LOG.error("EmailManualConsumer - falha ao processar email NAP", e);
        }
    }
}
