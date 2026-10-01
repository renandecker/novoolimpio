package br.com.sol7.olimpio.schedule.jobs;

import br.com.sol7.olimpio.schedule.maintenance.BasicoMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.CentralMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.CobrancaEmailMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.ComercialMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.EducacaoMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.EmpresaMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.FeriadoAjusteMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.FinanceiroMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.NapEmailMaintenanceService;
import br.com.sol7.olimpio.schedule.maintenance.RelatoriosMaintenanceService;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Executa as rotinas de manutencao chamadas diretamente pelo SchedulingJobs.
 * <p>
 * Cada metodo roda em uma virtual thread e executa a
 * rotina de manutencao do dominio chamando os maintenance services de forma "sincrona" via
 * await().indefinitely(). Uma falha num passo nao impede os demais (mesmo espirito do try/catch
 * do legado), e uma falha no processamento inteiro e logada (o ack do Kafka so acontece apos o
 * retorno do metodo).
 */
@ApplicationScoped
public class MaintenanceConsumer {

    private static final Logger LOG = Logger.getLogger(MaintenanceConsumer.class);

    @Inject
    BasicoMaintenanceService basico;

    @Inject
    FinanceiroMaintenanceService financeiro;

    @Inject
    CentralMaintenanceService central;

    @Inject
    EducacaoMaintenanceService educacao;

    @Inject
    ComercialMaintenanceService comercial;

    @Inject
    RelatoriosMaintenanceService relatorios;

    @Inject
    NapEmailMaintenanceService napEmail;

    @Inject
    CobrancaEmailMaintenanceService cobrancaEmail;

    @Inject
    EmpresaMaintenanceService empresa;

    @Inject
    FeriadoAjusteMaintenanceService feriadoAjuste;

    public void processarEmpresa(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-empresa: %s", trigger);
        try {
            step("criarEntrevistas", empresa.criarEntrevistas().map(r -> {
                LOG.infof("MaintenanceConsumer - criarEntrevistas: %d vaga(s), %d entrevista(s)",
                        r.get("vagasProcessadas"), r.get("entrevistasCriadas"));
                return r;
            }))
                    .chain(() -> step("enviarVagasAlunos", empresa.enviarVagasAlunos().map(r -> {
                        LOG.infof("MaintenanceConsumer - enviarVagasAlunos: %d candidato(s) em %d lote(s)",
                                r.get("candidatos"), r.get("lotes"));
                        return r;
                    })))
                    .await().indefinitely();
            LOG.info("MaintenanceConsumer - job-empresa concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-empresa", e);
        }
    }

    public void processarBasico(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-basico: %s", trigger);
        try {
            step("atualizarSituacaoConta", basico.atualizarSituacaoConta())
                    .chain(() -> step("inativarUsuariosSemAcesso", basico.inativarUsuariosSemAcesso()))
                    .chain(() -> step("verificarConta", basico.verificarConta()))
                    .chain(() -> step("verificarCotaEmailAutomatico", basico.verificarCotaEmailAutomatico()))
                    .chain(() -> step("atualizarCompromissosAutomaticos", basico.atualizarCompromissosAutomaticos()))
                    .chain(() -> step("atualizarLogradouros", basico.atualizarLogradouros()))
                    .await().indefinitely();
            LOG.info("MaintenanceConsumer - job-basico concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-basico", e);
        }
    }

    public void processarEducacao(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-educacao: %s", trigger);
        try {
            step("verificarCotaTaxaCurso", educacao.verificarCotaTaxaCurso())
                    .chain(() -> step("verificarCotaDescontoCurso", educacao.verificarCotaDescontoCurso()))
                    .chain(() -> step("limparCancelamentoContratoVencido", educacao.limparCancelamentoContratoVencido()))
                    .chain(() -> step("replicarOferecimentoAutomatico", educacao.replicarOferecimentoAutomatico()))
                    .chain(() -> step("carregarChamadasPendentesAutomatico", educacao.carregarChamadasPendentesAutomatico()))
                    .await().indefinitely();
            LOG.info("MaintenanceConsumer - job-educacao concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-educacao", e);
        }
    }

    public void processarFinanceiro(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-financeiro: %s", trigger);
        try {
            step("verificarCotaFormaPagamento", financeiro.verificarCotaFormaPagamento())
                    .chain(() -> step("atualizarCobrancasAutomatico", financeiro.atualizarCobrancasAutomatico()))
                    .await().indefinitely();
            LOG.info("MaintenanceConsumer - job-financeiro concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-financeiro", e);
        }
    }

    public void processarCentral(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-central: %s", trigger);
        try {
            step("verificarOperacionalVencidos", central.verificarOperacionalVencidos()).await().indefinitely();
            LOG.info("MaintenanceConsumer - job-central concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-central", e);
        }
    }

    public void processarComercial(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-comercial: %s", trigger);
        try {
            step("atualizarIdadeProspectos", comercial.atualizarIdadeProspectos()).await().indefinitely();
            LOG.info("MaintenanceConsumer - job-comercial concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-comercial", e);
        }
    }

    public void processarRelatorios(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-relatorios: %s", trigger);
        try {
            step("removerExtratoresAntigos", relatorios.removerExtratoresAntigos()).await().indefinitely();
            LOG.info("MaintenanceConsumer - job-relatorios concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-relatorios", e);
        }
    }

    public void processarEmails(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-emails: %s", trigger);
        try {
            step("rotinaEmailNap", napEmail.rotinaEmailNap().map(r -> {
                LOG.infof("MaintenanceConsumer - rotinaEmailNap: %d configuracao(es), %d destinatario(s)",
                        r.configuracoes(), r.destinatarios());
                return r;
            }))
                    .chain(() -> step("rotinaEmailCobranca", cobrancaEmail.rotinaEmailCobranca().map(r -> {
                        LOG.infof("MaintenanceConsumer - rotinaEmailCobranca: %d configuracao(es), %d destinatario(s)",
                                r.configuracoes(), r.destinatarios());
                        return r;
                    })))
                    .await().indefinitely();
            LOG.info("MaintenanceConsumer - job-emails concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-emails", e);
        }
    }

    public void processarFechamentoCaixa(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-caixa (fluxo de caixa): %s", trigger);
        try {
            step("fechamentoCaixaAbertos", financeiro.fechamentoCaixaAbertos().map(resumo -> {
                LOG.infof("MaintenanceConsumer - fechamentoCaixaAbertos: %d caixa(s) fechado(s): %s",
                        resumo == null ? 0 : resumo.size(), resumo);
                return resumo;
            })).await().indefinitely();
            LOG.info("MaintenanceConsumer - job-caixa concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-caixa", e);
        }
    }

    public void processarFeriado(String trigger) {
        LOG.infof("MaintenanceConsumer - processando ajuste de feriados: %s", trigger);
        try {
            step("verificaFeriadosParaajustar", feriadoAjuste.verificaFeriadosParaajustar().map(r -> {
                LOG.info("MaintenanceConsumer - verificaFeriadosParaajustar concluido");
                return r;
            })).await().indefinitely();
            LOG.info("MaintenanceConsumer - ajuste de feriados concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no ajuste de feriados", e);
        }
    }

    public void processarCorrigirAvaliacoes(String trigger) {
        LOG.infof("MaintenanceConsumer - processando job-avaliacoes: %s", trigger);
        try {
            step("corrigirAvaliacoes", educacao.corrigirAvaliacoes()).await().indefinitely();
            LOG.info("MaintenanceConsumer - job-avaliacoes concluido");
        } catch (Exception e) {
            LOG.error("MaintenanceConsumer - falha inesperada no job-avaliacoes", e);
        }
    }

    /**
     * Executa um passo isolado: loga sucesso/erro e sempre continua para o proximo (nao propaga falha).
     */
    private <T> Uni<Void> step(String name, Uni<T> action) {
        return action.replaceWithVoid()
                .invoke(() -> LOG.debugf("MaintenanceConsumer - passo '%s' concluido", name))
                .onFailure().recoverWithItem(e -> {
                    LOG.errorf(e, "MaintenanceConsumer - passo '%s' falhou, seguindo para o proximo", name);
                    return null;
                });
    }
}
