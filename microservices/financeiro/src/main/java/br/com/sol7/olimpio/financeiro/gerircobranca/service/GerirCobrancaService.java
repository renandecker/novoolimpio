package br.com.sol7.olimpio.financeiro.gerircobranca;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import java.util.Date;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class GerirCobrancaService { @Inject GerirCobrancaRepository repository; public Uni<List<GerirCobrancaResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<GerirCobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<GerirCobrancaResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerirCobranca not found")).map(this::toResponse);} public Uni<GerirCobrancaResponse> create(GerirCobrancaRequest r){var e=new GerirCobranca();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<GerirCobrancaResponse> update(Long id,GerirCobrancaRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerirCobranca not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("GerirCobranca not found")));} private void apply(GerirCobranca e,GerirCobrancaRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private GerirCobrancaResponse toResponse(GerirCobranca e){return new GerirCobrancaResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de GerirCobrancaController.verificarAcesso (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerirCobrancaController.java:84, camada controller)
    // Observacao: parametro tipo: era TipoAcesso no legado; parametro modulo: era ModuloFacade no legado
    // Logica original (adaptar):
    // protected boolean verificarAcesso(TipoAcesso tipo, ModuloFacade modulo) {
    //         return JSFUtil.getUsuarioLogado().verificarAcesso(tipo, modulo);
    //     }
    public Uni<Boolean> verificarAcesso(String tipo, String modulo) {
        // Obs: depende do microservico basico (usuario logado / permissao de acesso)
        return Uni.createFrom().item(false);
    }


    // Migrado de GerirCobrancaController.carregarCobrancas (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/GerirCobrancaController.java:88, camada controller)
    // Logica original (adaptar):
    // public void carregarCobrancas() {
    //         semValor = false;
    //         gerirCobrancas = new ArrayList<GerirCobranca>();
    //         gerirCobrancasPessoas = new ArrayList<GerirCobrancaPessoa>();
    // 
    //         if (!ObjectUtil.nullOrEmpty(unidade) && !ObjectUtil.nullOrEmpty(mes) && !ObjectUtil.nullOrEmpty(ano)) {
    //             for (Date d : listarDatasDoMes()) {
    //                 gerirCobrancasPessoas = new ArrayList<GerirCobrancaPessoa>();
    //                 Long qtdeTotalCartas = 0L;
    //                 Long qtdeTotalEmail = 0L;
    //                 Long qtdeTotalLigacao = 0L;
    //                 List<Pessoa> listaPessoas = ligacaoCobrancaService.cobradasPessoas(unidade, d);
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarCobrancas() {
        // Obs: depende do estado de UI (unidade/mes/ano) e dos microservicos de ligacaoCobrancaService/emailService/custoServicoService
        return Uni.createFrom().voidItem();
    }

}