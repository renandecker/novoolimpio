package br.com.sol7.olimpio.comercial.categoriacampo;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class CategoriaCampoService { @Inject CategoriaCampoRepository repository; public Uni<List<CategoriaCampoResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<CategoriaCampoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<CategoriaCampoResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("CategoriaCampo not found")).map(this::toResponse);} public Uni<CategoriaCampoResponse> create(CategoriaCampoRequest r){var e=new CategoriaCampo();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<CategoriaCampoResponse> update(Long id,CategoriaCampoRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("CategoriaCampo not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("CategoriaCampo not found")));} private void apply(CategoriaCampo e,CategoriaCampoRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private CategoriaCampoResponse toResponse(CategoriaCampo e){return new CategoriaCampoResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de CategoriaCampoService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/comercial/CategoriaCampoService.java:22, camada service)
    // Logica original (adaptar):
    // public List<Categoria> autoComplete(String query) {
    //         return getCategoriaRepository().autoComplete(query.toLowerCase(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.find("lower(nome) like '%' || ?1 || '%' order by nome", query.toLowerCase())
                .page(io.quarkus.panache.common.Page.of(0, 10))
                .list().map(list -> list.stream().map(x -> x.id).toList());
    }

}