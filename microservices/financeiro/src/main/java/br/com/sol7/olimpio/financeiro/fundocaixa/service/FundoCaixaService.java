package br.com.sol7.olimpio.financeiro.fundocaixa;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import java.util.Date;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class FundoCaixaService { @Inject FundoCaixaRepository repository; public Uni<List<FundoCaixaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<FundoCaixaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<FundoCaixaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("FundoCaixa not found")).map(this::toResponse);} public Uni<FundoCaixaResponse> create(FundoCaixaRequest r){var e=new FundoCaixa();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<FundoCaixaResponse> update(Long id,FundoCaixaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("FundoCaixa not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("FundoCaixa not found")));} private void apply(FundoCaixa e,FundoCaixaRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private FundoCaixaResponse toResponse(FundoCaixa e){return new FundoCaixaResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de FundoCaixaController.verificarSenhaResponsavel (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/FundoCaixaController.java:160, camada controller)
    // Logica original (adaptar):
    // private boolean verificarSenhaResponsavel() {
    //         try {
    //             if (configuracaoCaixa == null) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Necess\u00E1rio configurar o caixa para esse usu\u00E1rio");
    //                 return false;
    //             }
    // 
    //             if (!ObjectUtil.nullOrEmpty(usuarioService.findByLoginAndSenha(configuracaoCaixa.getResponsavel().getLogin(), senha))) {
    //                 return true;
    //             } else {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Senha inválida, digite sua senha do autorizador " + configuracaoCaixa.getRespons ...
    // // ... (truncado, ver fonte original)
    // Obs: depende do microservico basico (usuarioService) e de estado de UI (configuracaoCaixa/senha do controller JSF)
    public Uni<Boolean> verificarSenhaResponsavel() {
        return Uni.createFrom().item(false);
    }


    // Migrado de FundoCaixaController.buscarMovimentacoes (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/FundoCaixaController.java:426, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarMovimentacoes(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             Caixa caixa = (Caixa) event.getData();
    //             this.caixa = caixa;
    //             detalhesCaixa = movimentacaoFinanceiraService.buscarMovimentacaoCaixaEntrada(caixa);
    //             List<Sangria> listSangria = sangriaService.buscarSangriaCaixa(caixa);
    // 
    //             for (Sangria s : listSangria) {
    //                 MovimentacaoFinanceira mov = new MovimentacaoFinanceira();
    //                 mov.setDataMovimento(s.getData());
    //                 mov.setValor(s.getValor());
    //                 mov.setHistorico("Sangria");
    // // ... (truncado, ver fonte original)
    // Obs: depende de MovimentacaoFinanceiraService/SangriaService (entidades nao portadas neste microservico) e de estado de UI (ToggleEvent)
    public Uni<Void> buscarMovimentacoes(String event) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de FundoCaixaController.imprimirSegundaVia (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/FundoCaixaController.java:476, camada controller)
    // Logica original (adaptar):
    // private void imprimirSegundaVia() {
    //         imprimirComprovantePagamento(movimentacaoFinanceira);
    //         ControleImpressao controleImpressao = new ControleImpressao();
    //         controleImpressao.setData(new Date());
    //         controleImpressao.setMovimentacaoFinanceira(movimentacaoFinanceira);
    //         controleImpressao.setUsuario(usuarioLogadoController.getUsuario());
    //         controleImpressaoService.save(controleImpressao);
    //         // controleImpressaoService.fechamentoCaixaAbertos(caixa, movimentacaoFinanceira, configuracaoCaixa);
    //         if (!caixa.getImpressora().isManual()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.SAVE, "global.sucess", "validation", "Segund ...
    // // ... (truncado, ver fonte original)
    // Obs: metodo de UI (impressao) que depende de ControleImpressaoService (nao portado neste microservico)
    public Uni<Void> imprimirSegundaVia() {
        return Uni.createFrom().voidItem();
    }


    // Migrado de FundoCaixaController.buscarCaixa (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/FundoCaixaController.java:491, camada controller)
    // Observacao: parametro movimentacaoFinanceiratempId: era MovimentacaoFinanceira (referencia por id)
    // Logica original (adaptar):
    // public void buscarCaixa(MovimentacaoFinanceira movimentacaoFinanceiratemp) {
    //         movimentacaoFinanceira = movimentacaoFinanceiratemp;
    //         this.caixa = movimentacaoFinanceira.getCaixa();
    //         configuracaoCaixa = configuracaoCaixaService.buscarConfiguracaoComUnidadeUsuario(caixa.getUsuario(), caixa.getUnidade());
    //         //  imprimirSegundaVia();
    //     }
    // Obs: depende de MovimentacaoFinanceira (nao portado neste microservico) e de estado de UI
    public Uni<Void> buscarCaixa(Long movimentacaoFinanceiratempId) {
        return Uni.createFrom().voidItem();
    }


    // Migrado de FundoCaixaController.verificarCotaImpressao (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/FundoCaixaController.java:498, camada controller)
    // Observacao: parametro movimentacaoFinanceiraId: era MovimentacaoFinanceira (referencia por id)
    // Logica original (adaptar):
    // public boolean verificarCotaImpressao(MovimentacaoFinanceira movimentacaoFinanceira) {
    //         if (movimentacaoFinanceira.getCaixa() != null) {
    //             Integer listaControle = Math.toIntExact(controleImpressaoService.verificarControle(movimentacaoFinanceira.getCaixa(), movimentacaoFinanceira));
    //             if (ObjectUtil.nullOrEmpty(listaControle)) {
    //                 listaControle = 0;
    //             }
    //             configuracaoCaixa = configuracaoCaixaService.buscarConfiguracaoComUnidadeUsuario(usuarioLogadoController.getUsuario(), movimentacaoFinanceira.getCaixa().getUnidade());
    //             if (configuracaoCaixa != null) {
    //                 this.caixa = movimentacaoFinanceira.getCaixa();
    //       ...
    // // ... (truncado, ver fonte original)
    // Obs: depende de ControleImpressaoService/ConfiguracaoCaixaService e de estado de UI (usuario logado)
    public Uni<Boolean> verificarCotaImpressao(Long movimentacaoFinanceiraId) {
        return Uni.createFrom().item(false);
    }


    // Migrado de FundoCaixaController.imprimirComprovantePagamento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/FundoCaixaController.java:523, camada controller)
    // Observacao: parametro movimentacaoFinanceiraId: era MovimentacaoFinanceira (referencia por id)
    // Logica original (adaptar):
    // private void imprimirComprovantePagamento(MovimentacaoFinanceira movimentacaoFinanceira) {
    //         ComprovantePagamento comprovantePagamento = atributosCompovante(movimentacaoFinanceira);
    //         impressoraController.imprimeComprovante(comprovantePagamento);
    //     }
    // Obs: metodo de UI (impressao via ImpressoraController) e depende de MovimentacaoFinanceira (nao portado neste microservico)
    public Uni<Void> imprimirComprovantePagamento(Long movimentacaoFinanceiraId) {
        return Uni.createFrom().voidItem();
    }

}