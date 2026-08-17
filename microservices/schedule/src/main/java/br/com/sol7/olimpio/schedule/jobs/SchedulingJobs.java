package br.com.sol7.olimpio.schedule.jobs;

import io.quarkus.scheduler.Scheduled;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Portado de br.com.sol7.olimpio.service.services.SchedulingService (legado).
 *
 * Cada rotina do legado virou um metodo separado (@Scheduled + @RunOnVirtualThread) e chama
 * diretamente os objetos de manutencao que usam a conexao compartilhada com o banco.
 *
 * As rotinas de manutencao rodam a partir da 1h da manha (America/Sao_Paulo); o fechamento de
 * caixa e a correcao de avaliacoes permanecem as 23h.
 *
 * A regra de ajuste de feriados (verificaFeriadosParaajustar) foi migrada do basico para o
 * schedule: agora o cron e o trigger manual executam a regra diretamente aqui via
 * FeriadoAjusteMaintenanceService.
 */
@ApplicationScoped
public class SchedulingJobs {

    private static final Logger LOG = Logger.getLogger(SchedulingJobs.class);

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

    // Migrado de SchedulingService.tudo() - verificaFeriadosParaajustar.
    // A regra agora e executada diretamente no schedule (FeriadoAjusteMaintenanceService),
    // que foi migrada do basico. O cron e o trigger manual via Kafka executam aqui.
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaFeriado() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaFeriado() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        maintenance.processarFeriado("scheduled");
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
}
