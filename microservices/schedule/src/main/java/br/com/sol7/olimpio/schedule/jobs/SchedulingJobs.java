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
 * Cada rotina do legado virou um metodo separado (@Scheduled + @RunOnVirtualThread), que apenas
 * publica um evento Kafka (canal job-<dominio>). A execucao real ficou nos consumidores
 * (MaintenanceConsumer) - tambem em virtual thread - que acessam diretamente o banco do dominio
 * atraves dos maintenance services. O evento job-feriado e consumido pelo microsservico basico,
 * dono da regra de ajuste de feriados/oferecimentos.
 *
 * As rotinas de manutencao rodam a partir da 1h da manha (America/Sao_Paulo); o fechamento de
 * caixa e a correcao de avaliacoes permanecem as 23h.
 */
@ApplicationScoped
public class SchedulingJobs {

    private static final Logger LOG = Logger.getLogger(SchedulingJobs.class);

    @Inject
    @Channel("job-basico-out")
    MutinyEmitter<String> jobBasico;

    @Inject
    @Channel("job-educacao-out")
    MutinyEmitter<String> jobEducacao;

    @Inject
    @Channel("job-financeiro-out")
    MutinyEmitter<String> jobFinanceiro;

    @Inject
    @Channel("job-central-out")
    MutinyEmitter<String> jobCentral;

    @Inject
    @Channel("job-comercial-out")
    MutinyEmitter<String> jobComercial;

    @Inject
    @Channel("job-relatorios-out")
    MutinyEmitter<String> jobRelatorios;

    @Inject
    @Channel("job-emails-out")
    MutinyEmitter<String> jobEmails;

    @Inject
    @Channel("job-feriado-out")
    MutinyEmitter<String> jobFeriado;

    @Inject
    @Channel("job-caixa-out")
    MutinyEmitter<String> jobCaixa;

    @Inject
    @Channel("job-avaliacoes-out")
    MutinyEmitter<String> jobAvaliacoes;

    @Inject
    @Channel("job-empresa-out")
    MutinyEmitter<String> jobEmpresa;

    // Migrado de SchedulingService.tudo() - dominio empresa/curriculo (VagaService), 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaEmpresa() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaEmpresa() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaEmpresa() - publicando trigger Kafka para a rotina do dominio empresa");
        send(jobEmpresa, "job-empresa", "criarEntrevistas;enviarVagasAlunos");
    }

    // Migrado de SchedulingService.tudo() - dominio basico, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaBasico() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaBasico() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaBasico() - publicando trigger Kafka para a rotina do dominio basico");
        send(jobBasico, "job-basico", "atualizarSituacaoConta;inativarUsuariosSemAcesso;verificarConta;verificarCotaEmailAutomatico;atualizarCompromissosAutomaticos;atualizarLogradouros");
    }

    // Migrado de SchedulingService.tudo() - dominio educacao, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaEducacao() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaEducacao() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaEducacao() - publicando trigger Kafka para a rotina do dominio educacao");
        send(jobEducacao, "job-educacao", "verificarCotaTaxaCurso;verificarCotaDescontoCurso;limparCancelamentoContratoVencido;replicarOferecimentoAutomatico;carregarChamadasPendentesAutomatico");
    }

    // Migrado de SchedulingService.tudo() - dominio financeiro, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaFinanceiro() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaFinanceiro() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaFinanceiro() - publicando trigger Kafka para a rotina do dominio financeiro");
        send(jobFinanceiro, "job-financeiro", "verificarCotaFormaPagamento;atualizarCobrancasAutomatico");
    }

    // Migrado de SchedulingService.tudo() - dominio central, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaCentral() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaCentral() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaCentral() - publicando trigger Kafka para a rotina do dominio central");
        send(jobCentral, "job-central", "verificarOperacionalVencidos");
    }

    // Migrado de SchedulingService.tudo() - dominio comercial, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaComercial() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaComercial() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaComercial() - publicando trigger Kafka para a rotina do dominio comercial");
        send(jobComercial, "job-comercial", "atualizarIdadeProspectos");
    }

    // Migrado de SchedulingService.tudo() - dominio relatorios, 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaRelatorios() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaRelatorios() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaRelatorios() - publicando trigger Kafka para a rotina do dominio relatorios");
        send(jobRelatorios, "job-relatorios", "removerExtratoresAntigos");
    }

    // Migrado de SchedulingService.tudo() - rotinas de email (NAP + cobranca), 1h da manha
    @Scheduled(cron = "{scheduler.tudo.cron:0 0 1 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaEmails() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaEmails() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaEmails() - publicando trigger Kafka para as rotinas de e-mail (NAP e cobranca)");
        send(jobEmails, "job-emails", "rotinaEmailNap;rotinaEmailCobranca");
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
        LOG.info("SchedulingJobs.rotinaFechamentoCaixa() - publicando trigger Kafka para o fechamento de caixas em aberto");
        send(jobCaixa, "job-caixa", "fechamentoCaixaAbertos");
    }

    // Migrado de SchedulingService.desativarCorrigirAvaliacoes() - 23h
    @Scheduled(cron = "{scheduler.corrigir-avaliacoes.cron:0 0 23 * * ?}", timeZone = "America/Sao_Paulo")
    @RunOnVirtualThread
    public void rotinaCorrigirAvaliacoes() {
        if (!jobsEnabled()) {
            LOG.info("SchedulingJobs.rotinaCorrigirAvaliacoes() - desabilitado via scheduler.jobs.enabled=false, pulando.");
            return;
        }
        LOG.info("SchedulingJobs.rotinaCorrigirAvaliacoes() - publicando trigger Kafka para a correcao de avaliacoes");
        send(jobAvaliacoes, "job-avaliacoes", "corrigirAvaliacoes");
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
