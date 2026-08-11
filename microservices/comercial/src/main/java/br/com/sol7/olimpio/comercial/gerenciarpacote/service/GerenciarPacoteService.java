package br.com.sol7.olimpio.comercial.gerenciarpacote;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
@ApplicationScoped @WithTransaction public class GerenciarPacoteService { @Inject GerenciarPacoteRepository repository; public Uni<List<GerenciarPacoteResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<GerenciarPacoteResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<GerenciarPacoteResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerenciarPacote not found")).map(this::toResponse);} public Uni<GerenciarPacoteResponse> create(GerenciarPacoteRequest r){var e=new GerenciarPacote();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<GerenciarPacoteResponse> update(Long id,GerenciarPacoteRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerenciarPacote not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("GerenciarPacote not found")));} private void apply(GerenciarPacote e,GerenciarPacoteRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private GerenciarPacoteResponse toResponse(GerenciarPacote e){return new GerenciarPacoteResponse(e.id,e.nome,e.dadosJson);} }