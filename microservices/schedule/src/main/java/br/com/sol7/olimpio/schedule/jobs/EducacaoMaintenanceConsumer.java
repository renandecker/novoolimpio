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
 * Consome os triggers manuais do educacao — um tópico por regra de negócio — e
 * executa a rotina correspondente:
 * <ul>
 *   <li>{@code olimpio.educacao.corrigir-avaliacoes} → correcao de avaliacoes;</li>
 *   <li>{@code olimpio.educacao.carregar-chamadas-pendentes} → carregamento de chamadas pendentes;</li>
 *   <li>{@code olimpio.educacao.remover-extratores-antigos} → remocao de extratores
 *       antigos com limpeza de pasta (rotina do dominio relatorios).</li>
 * </ul>
 */
@ApplicationScoped
public class EducacaoMaintenanceConsumer {

    private static final Logger LOG = Logger.getLogger(EducacaoMaintenanceConsumer.class);

    @Inject
    EducacaoMaintenanceService educacao;

    @Inject
    RelatoriosMaintenanceService relatorios;

    @Incoming("educacao-corrigir-avaliacoes")
    @Blocking
    @RunOnVirtualThread
    public void processarCorrigirAvaliacoes(String trigger) {
        LOG.infof("EducacaoMaintenanceConsumer - recebido trigger corrigirAvaliacoes: %s", trigger);
        try {
            educacao.corrigirAvaliacoes().await().indefinitely();
            LOG.info("EducacaoMaintenanceConsumer - corrigirAvaliacoes concluido");
        } catch (Exception e) {
            LOG.error("EducacaoMaintenanceConsumer - falha ao executar corrigirAvaliacoes", e);
        }
    }

    @Incoming("educacao-carregar-chamadas")
    @Blocking
    @RunOnVirtualThread
    public void processarCarregarChamadasPendentes(String trigger) {
        LOG.infof("EducacaoMaintenanceConsumer - recebido trigger carregarChamadasPendentes: %s", trigger);
        try {
            educacao.carregarChamadasPendentesAutomatico().await().indefinitely();
            LOG.info("EducacaoMaintenanceConsumer - carregarChamadasPendentes concluido");
        } catch (Exception e) {
            LOG.error("EducacaoMaintenanceConsumer - falha ao executar carregarChamadasPendentes", e);
        }
    }

    @Incoming("educacao-remover-extratores")
    @Blocking
    @RunOnVirtualThread
    public void processarRemoverExtratoresAntigos(String trigger) {
        LOG.infof("EducacaoMaintenanceConsumer - recebido trigger removerExtratoresAntigos: %s", trigger);
        try {
            relatorios.removerExtratoresAntigos().await().indefinitely();
            LOG.info("EducacaoMaintenanceConsumer - removerExtratoresAntigos concluido");
        } catch (Exception e) {
            LOG.error("EducacaoMaintenanceConsumer - falha ao executar removerExtratoresAntigos", e);
        }
    }
}
