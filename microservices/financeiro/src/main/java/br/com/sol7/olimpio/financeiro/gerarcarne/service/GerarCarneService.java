package br.com.sol7.olimpio.financeiro.gerarcarne;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import java.util.Date;
import java.math.BigDecimal;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class GerarCarneService { @Inject GerarCarneRepository repository; public Uni<List<GerarCarneResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<GerarCarneResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<GerarCarneResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerarCarne not found")).map(this::toResponse);} public Uni<GerarCarneResponse> create(GerarCarneRequest r){var e=new GerarCarne();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<GerarCarneResponse> update(Long id,GerarCarneRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerarCarne not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("GerarCarne not found")));} private void apply(GerarCarne e,GerarCarneRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private GerarCarneResponse toResponse(GerarCarne e){return new GerarCarneResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de GerarCarneController.carregarNovaParcela (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:208, camada controller)
    // Logica original (adaptar):
    // public void carregarNovaParcela() {
    //         desconto = new BigDecimal(0);
    //         multa = new BigDecimal(0);
    //         juros = new BigDecimal(0);
    //         valor = new BigDecimal(0);
    //     }
    // Obs: metodo de UI (zerar campos de tela), sem logica de dados portavel
    public Uni<Void> carregarNovaParcela() {
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarCarneController.imprimirSelecionadas (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:234, camada controller)
    // Observacao: retorno: era StreamedContent no legado
    // Logica original (adaptar):
    // public StreamedContent imprimirSelecionadas() throws MalformedURLException {
    //         HttpSession sessao = (HttpSession) FacesContext.getCurrentInstance().getExternalContext().getSession(false);
    //         Layout layout = layoutService.temaDaUnidade(Arrays.asList(contrato.getUnidadeResponsavel()));
    // 
    //         File logoFile = new File(applicationResources.getPath("") + layout.getFolderDocumento());
    //         if (!logoFile.exists()) {
    //             logoFile = new File(sessao.getServletContext().getRealPath(System.getProperty("file.separator") + "resources" + System.getProperty("file.separator") + "images" + System.getProperty("file.separator") + "semimafem.jpg"));
    //         }
    // 
    //         File pagoFile = new  ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de relatorio Jasper/StreamedContent), sem logica de dados portavel
    public Uni<String> imprimirSelecionadas() {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.imprimirHistorico (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:262, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent imprimirHistorico(Contrato cc) throws MalformedURLException {
    //         contrato = contratoService.findById(cc.getId());
    //         List<Matricula> matriculas = matriculaService.buscarMatriculasPorContrato(contrato);
    //         Layout layout = layoutService.temaDaUnidade(Arrays.asList(contrato.getUnidadeResponsavel()));
    // 
    //         File logoFile = new File(applicationResources.getPath("") + layout.getFolderDocumento());
    //         if (!logoFile.exists()) {
    //             HttpSession sessao = (HttpSession) FacesContext.getCurrentInstance().getExternalContext().getSession(false);
    //             logoFile = new File(sessao.getServletContext().getRealPath(System.getProperty("file.separator") + ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de relatorio) e depende dos microservicos educacao (contratoService, matriculaService) e basico (layoutService)
    public Uni<String> imprimirHistorico(Long ccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.imprimirDiarioClasse (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:332, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ofccId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent imprimirDiarioClasse(OferecimentoComponenteCurricular ofcc) throws MalformedURLException {
    //         List<DiarioClasseAluno> diarioClasseAlunos = new ArrayList<DiarioClasseAluno>();
    // 
    //         for (Matricula m : matriculaService.buscarMatriculasPorOferecimento(ofcc)) {
    //             DiarioClasseAluno diarioClasseAluno = new DiarioClasseAluno(m.getContrato().getPessoa().getPessoaFisica().getNome(), m.getContrato().getId().toString());
    //             diarioClasseAlunos.add(diarioClasseAluno);
    //         }
    //         List<DiarioClasseData> datas = new ArrayList<DiarioClasseData>();
    //         SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yy");
    //         ofcc = oferecimentoComponen ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de relatorio) e depende do microservico educacao (matriculaService, oferecimentoComponenteCurricular)
    public Uni<String> imprimirDiarioClasse(Long ofccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.imprimirBoletimTeste (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:362, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent imprimirBoletimTeste(Contrato cc) throws MalformedURLException {
    //         contrato = contratoService.findById(cc.getId());
    // 
    //         Layout layout = layoutService.temaDaUnidade(Arrays.asList(cc.getUnidadeResponsavel()));
    // 
    //         File logoFile = new File(applicationResources.getPath("") + layout.getFolderDocumento());
    //         if (!logoFile.exists()) {
    //             HttpSession sessao = (HttpSession) FacesContext.getCurrentInstance().getExternalContext().getSession(false);
    //             logoFile = new File(sessao.getServletContext().getRealPath(System.getProperty("file.separator") + "resources" + System.getProperty("file.separator") + "images" + System.getProperty("file.separ ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de relatorio) e depende dos microservicos educacao (contratoService) e basico (layoutService)
    public Uni<String> imprimirBoletimTeste(Long ccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarCarneMaterial (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:393, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro vendaProdutoId: era VendaProduto (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarCarneMaterial(VendaProduto vendaProduto) throws MalformedURLException {
    //         return gerarRelatorio("/WEB-INF/relatorios/carne3.jasper", new HashMap<String, Object>(), criarListaCarneMaterial(vendaProduto), vendaProduto.getPessoa().getPessoaFisica().getId().toString());
    //     }
    // Obs: metodo de UI (geracao de relatorio) e depende do microservico educacao/estoque (VendaProduto/Pessoa)
    public Uni<String> gerarCarneMaterial(Long vendaProdutoId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarCarne (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:397, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarCarne(Contrato cc) throws MalformedURLException {
    //         contrato = contratoService.findById(cc.getId());
    // 
    //         return gerarRelatorio("/WEB-INF/relatorios/carne3.jasper", new HashMap<String, Object>(), criarListaCarne(contrato), contrato.getPessoa().getPessoaFisica().getId().toString());
    //     }
    // Obs: metodo de UI (geracao de relatorio) e depende do microservico educacao (contratoService)
    public Uni<String> gerarCarne(Long ccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarDocumentoCancelamentoContrato (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:403, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarDocumentoCancelamentoContrato(Contrato cc) {
    // 
    //         ByteArrayOutputStream templateOutput = null;
    //         InputStream inputStream = null;
    //         try {
    //             File file = new File(applicationResources.getPath("/cancelamento") + File.separator + configuracaoParcela.getTemplateCancelamentoCurso());
    //             if (!file.exists()) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "erro.filecancelamento.notfound", null);
    //                 return null;
    //             }
    //             WordprocessingMLPackage template = getTemplate(applicationResources.getPath("/cancelamento") + File.separator + configuracaoParcela.getTemplat ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de documento Word) e depende do microservico educacao (Contrato) e de ConfiguracaoParcela local
    public Uni<String> gerarDocumentoCancelamentoContrato(Long ccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.carregarSituacao (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:519, camada controller)
    // Logica original (adaptar):
    // public void carregarSituacao() {
    //         alteracaoParcelas = false;
    //         parcelainicio = null;
    //         parcelafim = null;
    //         parcelainicio = null;
    //         contrato = null;
    //     }
    // Obs: metodo de UI (reset de estado de tela), sem logica de dados portavel
    public Uni<Void> carregarSituacao() {
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarCarneController.atualizarValorCancelamento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:756, camada controller)
    // Observacao: parametro parcelaId: era Parcela (referencia por id)
    // Logica original (adaptar):
    // public void atualizarValorCancelamento(Parcela parcela) {
    //         BigDecimal valorTotal = new BigDecimal(requerimentoCancelamento.getValorTotalPagar().replace(",", "."));
    // 
    //         if (parcela.getValor().floatValue() <= 0) {
    //             for (Parcela pp : listaParcelas) {
    //                 pp.setValor(new BigDecimal(valorTotal.floatValue() / listaParcelas.size()).setScale(2, BigDecimal.ROUND_HALF_UP));
    //             }
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Valor deve ser maior que zero!");
    //             return;
    //         }
    // 
    //         if (parcela.getValor().floatValue() >= valorTotal.floatValue() && listaParcelas.size() != 1) {
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (atualizacao de valores em lista em memoria do controller JSF) e depende de Parcela (nao portada neste microservico)
    public Uni<Void> atualizarValorCancelamento(Long parcelaId) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarCarneController.carregarRequerimentoCancelamentoContrato (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:895, camada controller)
    // Observacao: parametro contratoId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public void carregarRequerimentoCancelamentoContrato(Contrato contrato) {
    //         try {
    //             if (!contrato.getAtivo()) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Contrato já está cancelado", contrato.getClass().getSimpleName());
    //                 RequestContext.getCurrentInstance().execute("PF('cancelamento').hide();");
    //                 return;
    //             }
    //             if (!ObjectUtil.nullOrEmpty(contrato.getDataConclusao())) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Contrato já concluído");
    //                 RequestContext.getCurrentInstance().e ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI e depende do microservico educacao (Contrato)
    public Uni<Void> carregarRequerimentoCancelamentoContrato(Long contratoId) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarCarneController.verificarPreCancelamento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:917, camada controller)
    // Observacao: parametro cancelamentoId: era Cancelamento (referencia por id)
    // Logica original (adaptar):
    // public boolean verificarPreCancelamento(Cancelamento cancelamento) {
    //         alteracaoParcelas = false;
    //         if (configuracaoParcela.getVezesPreCancelamento() == 0) {
    //             alteracaoParcelas = true;
    //         }
    //         cancelamentoContrato = null;
    //         cancelamentoMatricula = null;
    //         if (cancelamento.getTipo().equals(TipoCancelamento.CONTRATO)) {
    //             List<CancelamentoContrato> preCancelamentos = cancelamentoContratoService.buscarPreCancelamentoContrato(cancelamento, contrato);
    // 
    //             if (!ObjectUtil.nullOrEmpty(preCancelamentos)) {
    //                 Double dias = DateUtil.diferencaEmDias(preCancelamentos.get(0).getDataCancelamento(), new Date());
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI e depende dos microservicos educacao/central (CancelamentoContratoService, Contrato) - entidades nao portadas neste microservico
    public Uni<Boolean> verificarPreCancelamento(Long cancelamentoId) {
        return Uni.createFrom().item(false);
    }


    // Migrado de GerarCarneController.gerarRequerimentoCancelamento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1167, camada controller)
    // Observacao: parametro cancelamentoId: era Cancelamento (referencia por id)
    // Logica original (adaptar):
    // public void gerarRequerimentoCancelamento(Cancelamento cancelamento) {
    //         try {
    //             bloquearCancelamentoComPreCancelamento = false;
    //             if (cancelamento.getTipo().equals(TipoCancelamento.CONTRATO)) {
    //                 matricula = null;
    //                 contrato.setCancelamento(cancelamento);
    //                 gestaoAlunoController.carregarMatriculasContrato();
    //                 turmaController.carregarTrocarTurmaContrato(contrato);
    //                 diasPagamento = diaPagamentoService.findAll();
    //                 prepararRequerimentoCancelamento(contrato, null);
    //                 requerimentoCancelamento = gerarCarneService.obterValoresCancelamento(contrato, null);
    //                 di ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (montagem de tela) e depende dos microservicos educacao (Contrato, Matricula, diaPagamentoService) e de GerarCarneService.obterValoresCancelamento (nao portado)
    public Uni<Void> gerarRequerimentoCancelamento(Long cancelamentoId) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarCarneController.carregarRequerimentoCancelamentoMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1225, camada controller)
    // Observacao: parametro matriculaId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public void carregarRequerimentoCancelamentoMatricula(Matricula matricula) {
    //         try {
    //             if (matricula.getDataCancelamento() != null) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Matricula já está cancelado");
    //                 RequestContext.getCurrentInstance().execute("PF('cancelamento').hide();");
    //                 return;
    //             }
    //             if (matricula.getStatus().equals(StatusMatricula.REPROVADO) || matricula.getStatus().equals(StatusMatricula.APROVADO)) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Matricula já concluída");
    //       ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI e depende do microservico educacao (Matricula)
    public Uni<Void> carregarRequerimentoCancelamentoMatricula(Long matriculaId) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de GerarCarneController.gerarPrevisaoContratual (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1262, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarPrevisaoContratual(Contrato cc) throws MalformedURLException {
    //         contrato = cc;
    // 
    //         ByteArrayOutputStream templateOutput = null;
    //         InputStream inputStream = null;
    //         try {
    //             File file = new File(applicationResources.getPath("/cancelamento") + File.separator + configuracaoParcela.getTemplateCancelamentoPrevisao());
    //             if (!file.exists()) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "erro.fileprevisaocancelamento.notfound", null);
    //                 return null;
    //             }
    //             WordprocessingMLPackage template = getTemplate(applicationResources.getPath("/cancelamento ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de documento Word) e depende do microservico educacao (Contrato)
    public Uni<String> gerarPrevisaoContratual(Long ccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarPrevisaoMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1304, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro mmId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarPrevisaoMatricula(Matricula mm) {
    //         Matricula matricula = matriculaService.findById(mm.getId());
    // 
    //         ByteArrayOutputStream templateOutput = null;
    //         InputStream inputStream = null;
    //         try {
    //             File file = new File(applicationResources.getPath("/cancelamento") + File.separator + configuracaoParcela.getTemplateCancelamentoPrevisao());
    //             if (!file.exists()) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "erro.fileprevisaocancelamento.notfound", null);
    //                 return null;
    //             }
    //             WordprocessingMLPackage template = getTemplate(applicationResources.getPa ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de documento Word) e depende do microservico educacao (Matricula, matriculaService)
    public Uni<String> gerarPrevisaoMatricula(Long mmId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarDocumentoCancelamentoMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1358, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro mmId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarDocumentoCancelamentoMatricula(Matricula mm) {
    //         Matricula matricula = matriculaService.findById(mm.getId());
    // 
    //         ByteArrayOutputStream templateOutput = null;
    //         InputStream inputStream = null;
    //         File file = new File(applicationResources.getPath("/cancelamento") + File.separator + configuracaoParcela.getTemplateCancelamento());
    //         if (!file.exists()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.error", "erro.filecancelamento.notfound", null);
    //             return null;
    //         }
    //         try {
    //             WordprocessingMLPackage template = getTemplate(applicationResources.getPath("/cancelamento") + F ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (geracao de documento Word) e depende do microservico educacao (Matricula, matriculaService)
    public Uni<String> gerarDocumentoCancelamentoMatricula(Long mmId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarViaDocumentoCancelamentoContratual (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1484, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro ccId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarViaDocumentoCancelamentoContratual(Contrato cc) {
    //         contrato = contratoService.findContratoCancelamentoById(cc.getId());
    // 
    //         hibernateService.executeUpdateSQL(" insert into edc_cancelamento_download (data_download,qtde , id_usuario, id_contrato) " +
    //                 " values (now(),1," + usuarioLogadoController.getUsuario().getId() + ", " + cc.getId() + ") on conflict on constraint uk_edc_cancelamento_download DO UPDATE " +
    //                 " SET  qtde = edc_cancelamento_download.qtde + 1 ");
    // 
    //         levantaconfiguracoesParcela(contrato);
    //         requerimentoCancelamento = gerarCarneService.obterValoresCancelamento(contrato, null);
    //         requerimentoCa ...
    // Obs: metodo de UI (geracao de documento Word) e depende dos microservicos educacao/central (Contrato, contratoService) - inclui insert em edc_cancelamento_download (microservico educacao)
    public Uni<String> gerarViaDocumentoCancelamentoContratual(Long ccId) {
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCarneController.gerarViaDocumentoCancelamentoMatricula (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerarCarneController.java:1497, camada controller)
    // Observacao: retorno: era StreamedContent no legado; parametro mmId: era Matricula (referencia por id)
    // Logica original (adaptar):
    // public StreamedContent gerarViaDocumentoCancelamentoMatricula(Matricula mm) throws MalformedURLException {
    //         matricula = matriculaService.findById(mm.getId());
    // 
    //         levantaconfiguracoesParcela(matricula.getContrato());
    //         requerimentoCancelamento = gerarCarneService.obterValoresCancelamento(null, matricula);
    //         requerimentoCancelamento.setListaParcelas(parcelaService.parcelasMatriculaCancelado(matricula));
    //         return gerarDocumentoCancelamentoMatricula(matricula);
    //     }
    // Obs: metodo de UI (geracao de documento Word) e depende dos microservicos educacao (Matricula, matriculaService) e de ParcelaService (nao portado neste microservico)
    public Uni<String> gerarViaDocumentoCancelamentoMatricula(Long mmId) {
        return Uni.createFrom().item(null);
    }

}