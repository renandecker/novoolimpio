package br.com.sol7.olimpio.schedule.jobs;

import br.com.sol7.olimpio.schedule.maintenance.EducacaoMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.RelatoriosMaintenanceService;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Consome triggers manuais do educacao (manual) e executa as rotinas de manutencao
 * de dominio: correcao de avaliacoes, carregamento de chamadas pendentes e remocao
 * de extratores antigos com limpeza de pasta.
 * Topico: olimpio.educacao.maintenance
 */
@ApplicationScoped
public class EducacaoMaintenanceConsumer {

    private static final Logger LOG = Logger.getLogger(EducacaoMaintenanceConsumer.class);

    @Inject
    EducacaoMaintenanceService educacao;

    @Inject
    RelatoriosMaintenanceService relatorios;

    @Incoming("educacao-maintenance")
    @Blocking
    @RunOnVirtualThread
    public void processarEducacaoMaintenance(String action) {
        LOG.infof("EducacaoMaintenanceConsumer - recebido trigger manual do educacao: %s", action);
        try {
            switch (action) {
                case "corrigirAvaliacoes" ->educacao.corrigirAvaliacoes().await().indefinitely();
                case "carregarChamadasPendentes" ->educacao.carregarChamadasPendentesAutomatico().await().indefinitely();
                case "removerExtratoresAntigos" ->relatorios.removerExtratoresAntigos().await().indefinitely();
                default ->{
                    LOG.warnf("EducacaoMaintenanceConsumer - acao desconhecida: %s", action);
                    return;
                }
            }
            LOG.infof("EducacaoMaintenanceConsumer - acao '%s' concluida", action);
        } catch (Exception e) {
            LOG.errorf(e, "EducacaoMaintenanceConsumer - falha ao executar acao '%s'", action);
        }
    }
}
