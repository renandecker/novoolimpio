package br.com.sol7.olimpio.schedule.jobs;

import io.quarkus.scheduler.Scheduled;
import io.smallrye.common.annotation.RunOnVirtualThread;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.jboss.logging.Logger;

/**
 * Portado de br.com.sol7.olimpio.service.services.SchedulingService (legado).
 *
 * Cada rotina do legado virou um metodo separado (@Scheduled + @RunOnVirtualThread) e chama
 * diretamente os objetos de manutencao que usam a conexao compartilhada com o banco. O evento
 * job-feriado continua sendo consumido pelo microsservico basico, dono da regra de ajuste de
 * feriados/oferecimentos.
 *
 * As rotinas de manutencao rodam a partir da 1h da manha (America/Sao_Paulo); o fechamento de
 * caixa e a correcao de avaliacoes permanecem as 23h.
 */
@ApplicationScoped
public class SchedulingJobs {

    private static final Logger LOG = Logger.getLogger(SchedulingJobs.class);

    @Inject
    @Channel("job-feriado-out")
    MutinyEmitter<String> jobFeriado;

    @Inject
    MaintenanceConsumer maintenance;

    // Migrado de SchedulingService.tudo() - dominio empresa/curriculo (VagaService), 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaEmpresa() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaEmpresa() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarEmpresa("scheduled");
    }

    // Migrado de SchedulingService.tudo() - dominio basico, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaBasico() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaBasico() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarBasico("scheduled");
    }

    // Migrado de SchedulingService.tudo() - dominio educacao, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaEducacao() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaEducacao() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarEducacao("scheduled");
    }

    // Migrado de SchedulingService.tudo() - dominio financeiro, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaFinanceiro() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaFinanceiro() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarFinanceiro("scheduled");
    }

    // Migrado de SchedulingService.tudo() - dominio central, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaCentral() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaCentral() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarCentral("scheduled");
    }

    // Migrado de SchedulingService.tudo() - dominio comercial, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaComercial() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaComercial() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarComercial("scheduled");
    }

    // Migrado de SchedulingService.tudo() - dominio relatorios, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaRelatorios() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaRelatorios() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarRelatorios("scheduled");
    }

    // Migrado de SchedulingService.tudo() - rotinas de email (NAP + cobranca), 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaEmails() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaEmails() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarEmails("scheduled");
    }

    // Migrado de SchedulingService.tudo() - verificaFeriadosParaajustar (basico.FeriadoAjuste).
    // O schedule apenas dispara; quem executa a regra de ajuste de feriados/oferecimentos e o
    // microsservico basico (FeriadoAjusteConsumer -> FeriadoAjusteService).
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaFeriado() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaFeriado() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaFeriado() - publicando trigger Kafka para o ajuste de feriados (consumido pelo basico)");
        send(jobFeriado, "job-feriado", "verificaFeriadosParaajustar");
    }

    // Migrado de SchedulingService.fechamentoCaixaAbertos() - 23h (fluxo de caixa)
    @Scheduled(cron = "{scheduler.fechamento-caixa.cron:0 0 23 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaFechamentoCaixa() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaFechamentoCaixa() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarFechamentoCaixa("scheduled");
    }

    // Migrado de SchedulingService.desativarCorrigirAvaliacoes() - 23h
    @Scheduled(cron = "{scheduler.corrigir-avaliacoes.cron:0 0 23 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaCorrigirAvaliacoes() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaCorrigirAvaliacoes() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarCorrigirAvaliacoes("scheduled");
    }

    private boolean jobsEnabled() {
        return !"false".equalsIgnoreCase(System.getenv().getOrDefault("SCHEDULER_JOBS_ENABLED", "true"));
    }

    /** Publica o trigger no Kafka aguardando o ack. Falha nao derruba o agendamento: e logada. */
    private void send(MutinyEmitter<String> emitter, String canal, String payload) {
        emitter.send(payload)
                .subscribe().with(
                        v -> LOG.infof("SchedulingJobs - trigger '%s' publicado com sucesso", canal),
                        e -> LOG.errorf(e, "SchedulingJobs - falha ao publicar trigger '%s' no Kafka", canal)
                );
    }
}
