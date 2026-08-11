package br.com.sol7.olimpio.relatorios.relatorio;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class RelatorioService { @Inject RelatorioRepository repository; public Uni<List<RelatorioResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<RelatorioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<RelatorioResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("Relatorio not found")).map(this::toResponse);} public Uni<RelatorioResponse> create(RelatorioRequest r){var e=new Relatorio();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<RelatorioResponse> update(Long id,RelatorioRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("Relatorio not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("Relatorio not found")));} private void apply(Relatorio e,RelatorioRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private RelatorioResponse toResponse(Relatorio e){return new RelatorioResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de RelatorioController.carregarRelatorio (src/main/java/br/com/sol7/olimpio/control/controllers/relatorios/RelatorioController.java:34, camada controller)
    // Logica original (adaptar):
    // public void carregarRelatorio() {
    //         String from = "";
    //         conexaoOlimpio = new JdbcTemplate(dataSource);
    // 
    // 		/*String unidade = "";
    // 		for(Unidade uni: usuarioLogadoController.getUnidadesDisponiveis()){
    // 			if(!unidade.equals("")){
    // 				unidade=unidade+","+uni.getId();
    // 			}else{
    // 				unidade= String.valueOf(uni.getId());
    // 			}
    // 		}
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarRelatorio() {
        // Obs: logica de UI do controlador JSF legado (monta lazy data models via JdbcTemplate) e depende do microservico basico (usuario logado), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }

}