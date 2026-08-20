package br.com.sol7.olimpio.educacao.gestaoaluno;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import java.util.Date;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class GestaoAlunoService {
    @Inject
    GestaoAlunoRepository repository;

    public Uni<List<GestaoAlunoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GestaoAlunoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GestaoAlunoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GestaoAluno not found")).map(this::toResponse);
    }

    public Uni<GestaoAlunoResponse> create(GestaoAlunoRequest r) {
        var e = new GestaoAluno();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GestaoAlunoResponse> update(Long id, GestaoAlunoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GestaoAluno not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GestaoAluno not found")));
    }

    private void apply(GestaoAluno e, GestaoAlunoRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GestaoAlunoResponse toResponse(GestaoAluno e) {
        return new GestaoAlunoResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de GestaoAlunoController.carregarPreCancelamentosContrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:204, camada controller)
    // Observacao: parametro contratoId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public void carregarPreCancelamentosContrato(Contrato contrato) {
    //         FilterPreCancelamentoContrato filterPreCancelamentoContrato = new FilterPreCancelamentoContrato(contrato);
    //         cancelamentoContratoes = new BaseLazyModelJPASpecific<CancelamentoContrato>(cancelamentoContratoService.getCancelamentoContratoRepository(), filterPreCancelamentoContrato);
    // 
    //     }
    public Uni<Void> carregarPreCancelamentosContrato(Long contratoId) {
        // Obs: lazy data model de cancelamentoContratoService (microservico matricula) e estado da tela (contrato)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarPreCancelamentosMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:210, camada controller)
    // Observacao: parametro matriculaId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public void carregarPreCancelamentosMatricula(Matricula matricula) {
    //         FilterPreCancelamentoMatricula filterPreCancelamentoMatricula = new FilterPreCancelamentoMatricula(matricula);
    //         cancelamentoMatriculas = new BaseLazyModelJPASpecific<CancelamentoMatricula>(cancelamentoMatriculaService.getCancelamentoMatriculaRepository(), filterPreCancelamentoMatricula);
    //     }
    public Uni<Void> carregarPreCancelamentosMatricula(Long matriculaId) {
        // Obs: lazy data model de cancelamentoMatriculaService (microservico matricula) e estado da tela (matricula)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.verificarCOnfiguraParcelaGlobal (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:257, camada controller)
    // Logica original (adaptar):
    // private void verificarCOnfiguraParcelaGlobal() {
    //         perfilPodeEditarParcelas = false;
    //         if (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             perfilPodeEditarParcelas = true;
    //         } else {
    //             if (!ObjectUtil.nullOrEmpty(pessoa)) {
    //                 List<Contrato> con = contratoService.buscarContratosPessoa(pessoa);
    //                 for (Contrato contrato : con) {
    //                     ConfiguracaoParcela confparcela = configuracaoParcelaService.buscarConf(contrato.getUnidadeResponsavel());
    //                     if (confparcela != null) {
    //                         for (Perfil perfil : usuarioLogadoController.getPerfis()) {
    //         ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> verificarCOnfiguraParcelaGlobal() {
        // Obs: depende do usuario logado (hierarquia/perfis) e dos microservicos financeiro (contratoService/configuracaoParcelaService) e basico (pessoa)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.atualizarDataVencimento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:281, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public void atualizarDataVencimento(Parcela parcela) {
    //         try {
    //             hibernateService.executeUpdateSQL(" update fin_parcela set data_vencimento = '" + DateUtil.getDateAsFormatedUSAString(parcela.getDataVencimento()) + "' where data_pagamento is null and  id =" + parcela.getId());
    //             gerarCarneController.setAlteracaoParcelas(true);
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Data vencimento da parcela atualizado com Sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.ERROR, "global.error", "validation", "Erro ao atualizar data vencimento da parcela ...
    public Uni<Void> atualizarDataVencimento(Long parcelaId) {
        // Obs: SQL nativa em fin_parcela (microservico financeiro) e estado da tela (parcela); nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.atualizarValorVencimento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:291, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public void atualizarValorVencimento(Parcela parcela) {
    //         try {
    //             hibernateService.executeUpdateSQL(" update fin_parcela set valor = " + parcela.getValor() + " where data_pagamento is null and id =" + parcela.getId());
    //             gerarCarneController.setAlteracaoParcelas(true);
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Valor da parcela atualizado com Sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.ERROR, "global.error", "validation", "Erro ao atualizar valor parcela.");
    //         }
    //     }
    public Uni<Void> atualizarValorVencimento(Long parcelaId) {
        // Obs: SQL nativa em fin_parcela (microservico financeiro); nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.atualizarDescontoParcela (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:301, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public void atualizarDescontoParcela(Parcela parcela) {
    //         try {
    //             hibernateService.executeUpdateSQL(" update fin_parcela set desconto = " + parcela.getDesconto() + " where data_pagamento is null and id =" + parcela.getId());
    //             gerarCarneController.setAlteracaoParcelas(true);
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Desconto da parcela atualizado com Sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.ERROR, "global.error", "validation", "Erro ao atualizar desconto parcela.");
    //         }
    //     }
    public Uni<Void> atualizarDescontoParcela(Long parcelaId) {
        // Obs: SQL nativa em fin_parcela (microservico financeiro); nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.atualizarJurosParcela (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:311, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public void atualizarJurosParcela(Parcela parcela) {
    //         try {
    //             hibernateService.executeUpdateSQL(" update fin_parcela set juros = " + parcela.getJuros() + " where data_pagamento is null and id =" + parcela.getId());
    //             gerarCarneController.setAlteracaoParcelas(true);
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Juros da parcela atualizado com Sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.ERROR, "global.error", "validation", "Erro ao atualizar juros parcela.");
    //         }
    //     }
    public Uni<Void> atualizarJurosParcela(Long parcelaId) {
        // Obs: SQL nativa em fin_parcela (microservico financeiro); nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.atualizarMultaParcela (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:321, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public void atualizarMultaParcela(Parcela parcela) {
    //         try {
    //             hibernateService.executeUpdateSQL(" update fin_parcela set multa = " + parcela.getMulta() + " where data_pagamento is null and id =" + parcela.getId());
    //             gerarCarneController.setAlteracaoParcelas(true);
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Multa da parcela atualizado com Sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.ERROR, "global.error", "validation", "Erro ao atualizar multa parcela.");
    //         }
    //     }
    public Uni<Void> atualizarMultaParcela(Long parcelaId) {
        // Obs: SQL nativa em fin_parcela (microservico financeiro); nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.ajusteManualValorReparcela (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:410, camada controller)
    // Observacao: parametro parcela: era ParcelaWapper no legado
    // Logica original (adaptar):
    // public boolean ajusteManualValorReparcela(ParcelaWapper parcela) {
    //         if (usuarioLogadoController.getUsuario().getHierarquia().equals(HierarquiaPerfil.ADMIN)) {
    //             return true;
    //         }
    //         if (configuracaoParcela != null && quantidadesVezes != null) {
    //             int total = (int) (quantidadesVezes * (configuracaoParcela.getQtdeReparcValorManual().floatValue() / 100));
    //             if (parcela.getParcela().getParcela() <= total) {
    //                 return true;
    //             }
    //         }
    //         return false;
    //     }
    public Uni<Boolean> ajusteManualValorReparcela(String parcela) {
        // Obs: depende do usuario logado (hierarquia) e do estado da tela (configuracaoParcela, quantidadesVezes, parcela)
        return Uni.createFrom().item(false);
    }


    // Migrado de GestaoAlunoController.autoCompleteAluno (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:671, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAluno(String query) {
    //         return contratoService.autoCompleteAluno(query);
    //     }
    public Uni<List<Long>> autoCompleteAluno(String query) {
        // Obs: depende do microservico financeiro (contratoService.autoCompleteAluno)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de GestaoAlunoController.gerarContrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:675, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarContrato(Contrato cc) {
    //         this.contrato = cc;
    //         ByteArrayOutputStream templateOutput = null;
    //         InputStream inputStream = null;
    // 
    //         try {
    //             hibernateService.executeUpdateSQL(" insert into edc_contrato_download (data_download,qtde , id_usuario, id_contrato) " +
    //                     " values (now(),1," + usuarioLogadoController.getUsuario().getId() + ", " + cc.getId() + ") on conflict on constraint uk_edc_contrato_download DO UPDATE " +
    //                     " SET  qtde = edc_contrato_download.qtde + 1 ");
    // 
    //             File file = new File(applicationResources.getPath("/contrato") + File.separator + contrato.getCurriculo().getTemplateCon ...
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarContrato(Long ccId) {
        // Obs: geracao de PDF (template de contrato) e insert/update em edc_contrato_download; nao portado
        return Uni.createFrom().item(null);
    }


    // Migrado de GestaoAlunoController.gerarPromissoria (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:722, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarPromissoria(Contrato cc) {
    //         this.contrato = cc;
    //         ByteArrayOutputStream templateOutput = null;
    //         InputStream inputStream = null;
    //         try {
    //             hibernateService.executeUpdateSQL(" insert into edc_promissoria_download (data_download,qtde , id_usuario, id_contrato) " +
    //                     " values (now(),1," + usuarioLogadoController.getUsuario().getId() + ", " + cc.getId() + ") on conflict on constraint uk_edc_promissoria_download DO UPDATE " +
    //                     " SET  qtde = edc_promissoria_download.qtde + 1 ");
    // 
    //             File file = new File(applicationResources.getPath("/promissoria") + File.separator + contrato.getCurriculo(). ...
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarPromissoria(Long ccId) {
        // Obs: geracao de PDF (template de promissoria) e insert/update em edc_promissoria_download; nao portado
        return Uni.createFrom().item(null);
    }


    // Migrado de GestaoAlunoController.buscarParcelas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:886, camada controller)
    // Logica original (adaptar):
    // public void buscarParcelas() {
    //         parcelasSelecionadas = new ArrayList<>();
    //         parcelasWapperSelecionadas = new ArrayList<>();
    //         if (ObjectUtil.nullOrEmpty(listFormaPagamento)) {
    //             return;
    //         }
    //         double valorNovoTotal = 0.0;
    //         for (ParcelaWapper pw : parcelasWapperSelecionadasAntigas) {
    //             valorNovoTotal += pw.getTotalpagar();
    //         }
    //         valorNovoTotal = valorNovoTotal / quantidadesVezes;
    // 
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarParcelas() {
        // Obs: logica de parcelas (fin_parcela, microservico financeiro) e estado da tela; nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.buscarMatriculas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:908, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarMatriculas(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             contrato = (Contrato) event.getData();
    //             matriculas = matriculaService.buscarMatriculasPorContrato(contrato);
    //         }
    //     }
    public Uni<Void> buscarMatriculas(String event) {
        // Obs: logica de UI (ToggleEvent) e depende do microservico matricula (matriculaService.buscarMatriculasPorContrato)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.buscarDiasPagamento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1256, camada controller)
    // Logica original (adaptar):
    // public void buscarDiasPagamento() {
    //         if (verificaDataInicialRetroativa()) return;
    //         diasPagamento = new ArrayList<>();
    //         if (!ObjectUtil.nullOrEmpty(dataPrimeiraParcela)) {
    //             List<DiaPagamento> dias = diaPagamentoService.findAll();
    //             Date dataInicial = dataPrimeiraParcela;
    //             Date dataFinal = DateUtil.somarDias(dataPrimeiraParcela, configuracaoParcela.getPrazoReparcSegunda());
    //             diasPagamento = gerarDataParcela(dias, dataInicial, dataFinal);
    //         }
    //         distribuirDatasParcela();
    //     }
    public Uni<Void> buscarDiasPagamento() {
        // Obs: depende dos microservicos financeiro (diaPagamentoService, configuracaoParcela) e estado da tela; nao portado
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarHistoricoCobranca (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1284, camada controller)
    // Logica original (adaptar):
    // public void carregarHistoricoCobranca() {
    //         if (!ObjectUtil.nullOrEmpty(pessoa)) {
    //             FilterLigacaoCobrancaComPessoa filterLigacaoNapComPessoa = new FilterLigacaoCobrancaComPessoa(pessoa);
    //             historicoCobrancaLigacao = new BaseLazyModelJPASpecific<LigacaoCobranca>(ligacaoCobrancaService.getLigacaoCobrancaRepository(), filterLigacaoNapComPessoa);
    // 
    //             FilterEmailCobrancaComPessoa filterEmailNapComPessoa = new FilterEmailCobrancaComPessoa(pessoa);
    //             historicoCobrancaEmail = new BaseLazyModelJPASpecific<EmailCobranca>(emailCobrancaService.getEmailCobrancaRepository(), filterEmailNapComPessoa);
    //         }
    //     }
    public Uni<Void> carregarHistoricoCobranca() {
        // Obs: lazy data models de ligacaoCobrancaService/emailCobrancaService (microservico financeiro/basico) e estado da tela (pessoa)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.buscarDetalheNotas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1294, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarDetalheNotas(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             Matricula matricula = (Matricula) event.getData();
    //             notaComponenteCurricularMatriculas = notaComponenteCurricularMatriculaService.obterNotasComMatricula(matricula);
    //             if (matricula.getOferecimentoComponenteCurricular().getCurriculo().getGrau().getTipoGrau().equals("n")) {
    //                 grau = grauService.buscarGrauComNota(matricula.getOferecimentoComponenteCurricular().getCurriculo().getGrau());
    //             }
    //             if (matricula.getOferecimentoComponenteCurricular().getCurriculo().getGrau().getTipoGrau().equals("c")) {
    //                 grau =  ...
    public Uni<Void> buscarDetalheNotas(String event) {
        // Obs: logica de UI (ToggleEvent) e depende do microservico matricula (notaComponenteCurricularMatriculaService) e do grauService local
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.buscarDetalhePresencasTrocaTurma (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1307, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarDetalhePresencasTrocaTurma(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             TrocaTurma mmm = (TrocaTurma) event.getData();
    //             FilterPresencaComMatricula filterMaterialPessoa = new FilterPresencaComMatricula(mmm.getMatricula(), mmm.getTurmaAntes());
    //             cadernoComponenteCurriculars = new BaseLazyModelJPASpecific<CadernoComponenteCurricular>(cadernoComponenteCurricularService.getCadernoComponenteCurricularRepository(), filterMaterialPessoa);
    //         }
    //     }
    public Uni<Void> buscarDetalhePresencasTrocaTurma(String event) {
        // Obs: lazy data model de cadernoComponenteCurricularService (microservico matricula) e estado da tela (trocaTurma)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.buscarDetalhePresencas (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1315, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarDetalhePresencas(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             Matricula mmm = (Matricula) event.getData();
    //             FilterPresencaComMatricula filterMaterialPessoa = new FilterPresencaComMatricula(mmm, mmm.getOferecimentoComponenteCurricular());
    //             cadernoComponenteCurriculars = new BaseLazyModelJPASpecific<CadernoComponenteCurricular>(cadernoComponenteCurricularService.getCadernoComponenteCurricularRepository(), filterMaterialPessoa);
    //         }
    //     }
    public Uni<Void> buscarDetalhePresencas(String event) {
        // Obs: lazy data model de cadernoComponenteCurricularService (microservico matricula) e estado da tela (matricula)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarMatriculasMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1323, camada controller)
    // Logica original (adaptar):
    // public void carregarMatriculasMatricula() {
    //         if (!ObjectUtil.nullOrEmpty(matricula)) {
    //             FilterMatricula filterMatricula = new FilterMatricula(matricula);
    //             matriculaLazyDataModel = new BaseLazyModelJPASpecific<Matricula>(matriculaService.getMatriculaRepository(), filterMatricula);
    //         }
    //     }
    public Uni<Void> carregarMatriculasMatricula() {
        // Obs: lazy data model de matriculaService (microservico matricula) e estado da tela (matricula)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarMatriculasPessoa (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1330, camada controller)
    // Logica original (adaptar):
    // public void carregarMatriculasPessoa() {
    //         if (!ObjectUtil.nullOrEmpty(pessoa)) {
    //             FilterMaterialPessoa filterMaterialPessoa = new FilterMaterialPessoa(pessoa);
    //             matriculaLazyDataModel = new BaseLazyModelJPASpecific<Matricula>(matriculaService.getMatriculaRepository(), filterMaterialPessoa);
    //         }
    //     }
    public Uni<Void> carregarMatriculasPessoa() {
        // Obs: lazy data model de matriculaService (microservico matricula) e estado da tela (pessoa)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarMatriculasContrato (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1380, camada controller)
    // Logica original (adaptar):
    // public void carregarMatriculasContrato() {
    //         if (!ObjectUtil.nullOrEmpty(contrato)) {
    //             FilterMatriculasComContrato matriculasComContrato = new FilterMatriculasComContrato(contrato);
    //             matriculaLazyDataModel = new BaseLazyModelJPASpecific<Matricula>(matriculaService.getMatriculaRepository(), matriculasComContrato);
    //         }
    //     }
    public Uni<Void> carregarMatriculasContrato() {
        // Obs: lazy data model de matriculaService (microservico matricula) e estado da tela (contrato)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarHistoricoNap (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1387, camada controller)
    // Logica original (adaptar):
    // public void carregarHistoricoNap() {
    //         if (!ObjectUtil.nullOrEmpty(pessoa)) {
    //             FilterLigacaoNapComPessoa filterLigacaoNapComPessoa = new FilterLigacaoNapComPessoa(pessoa);
    //             historicoNapLigacao = new BaseLazyModelJPASpecific<LigacaoNap>(ligacaoNapService.getLigacaoNapRepository(), filterLigacaoNapComPessoa);
    // 
    //             FilterEmailNapComPessoa filterEmailNapComPessoa = new FilterEmailNapComPessoa(pessoa);
    //             historicoNapEmail = new BaseLazyModelJPASpecific<EmailNap>(emailNapService.getEmailNapRepository(), filterEmailNapComPessoa);
    //         }
    //     }
    public Uni<Void> carregarHistoricoNap() {
        // Obs: lazy data models de ligacaoNapService/emailNapService (microservico financeiro/basico) e estado da tela (pessoa)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.ajustarResponsavel (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1486, camada controller)
    // Logica original (adaptar):
    // public void ajustarResponsavel() {
    //         try {
    //             if (PessoaUtil.maiorIdade(contrato.getResponsavel().getPessoaFisica().getDataNascimento())) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "label.idade_contratante_maior_idade", null, getEntityClass().getSimpleName());
    //                 RequestContext.getCurrentInstance().execute("PF('responsavel').show();");
    //                 return;
    //             }
    //             contratoService.save(contrato);
    //             RequestContext.getCurrentInstance().update("mainForm");
    //             RequestContext.getCurrentInstance().execute("PF('responsavel').hide();");
    //             MessageUtil.sendMessageToUser ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> ajustarResponsavel() {
        // Obs: logica de UI (RequestContext) e depende do microservico financeiro (contratoService.save) e do basico (pessoa/responsavel)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.ajustarUnidadeResponsavel (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1503, camada controller)
    // Logica original (adaptar):
    // public void ajustarUnidadeResponsavel() {
    //         try {
    //             contratoService.save(contrato);
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Unidade trocada com sucesso.");
    //         } catch (Exception e) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Ocorreu um erro ao trocar Unidade.");
    //             e.printStackTrace();
    //         }
    //     }
    public Uni<Void> ajustarUnidadeResponsavel() {
        // Obs: depende do microservico financeiro (contratoService.save)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.carregarResponsaveis (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1523, camada controller)
    // Observacao: parametro alunoId: era Pessoa (referencia por id)
    // Logica original (adaptar):
    // public void carregarResponsaveis(Pessoa aluno) {
    //         responsaveis = contratoService.buscarResponsaveisPessoa(aluno);
    //         if (ObjectUtil.nullOrEmpty(responsaveis)) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Esta pessoa não tem responsável");
    //             RequestContext.getCurrentInstance().execute("PF('cadastraResponsavel').hide();");
    //             return;
    //         }
    //         pessoaFisicaController.setPessoa(responsaveis.get(0));
    //         if(responsaveis.get(0).getPessoaFisica() != null){
    //             pessoaFisicaController.setEntity(responsaveis.get(0).getPessoaFisica());
    //         }else{
    //             pessoaJuridicaController. ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarResponsaveis(Long alunoId) {
        // Obs: depende do microservico financeiro (contratoService.buscarResponsaveisPessoa) e do basico (pessoaFisicaController)
        return Uni.createFrom().voidItem();
    }


    // Migrado de GestaoAlunoController.verificarAcesso (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GestaoAlunoController.java:1686, camada controller)
    // Observacao: parametro tipo: era TipoAcesso no legado; parametro modulo: era ModuloFacade no legado
    // Logica original (adaptar):
    // protected boolean verificarAcesso(TipoAcesso tipo, ModuloFacade modulo) {
    //         return JSFUtil.getUsuarioLogado().verificarAcesso(tipo, modulo);
    //     }
    public Uni<Boolean> verificarAcesso(String tipo, String modulo) {
        // Obs: depende do usuario logado (JSFUtil.getUsuarioLogado().verificarAcesso, microservico de autenticacao)
        return Uni.createFrom().item(false);
    }

}
