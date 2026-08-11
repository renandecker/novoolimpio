package br.com.sol7.olimpio.estoque.produtocampo;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ProdutoCampoService {

    @Inject ProdutoCampoRepository repository;

    public Uni<List<ProdutoCampoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProdutoCampoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ProdutoCampoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ProdutoCampo not found"))
                .map(this::toResponse);
    }

    public Uni<ProdutoCampoResponse> create(ProdutoCampoRequest r) {
        var e = new ProdutoCampo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProdutoCampoResponse> update(Long id, ProdutoCampoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ProdutoCampo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ProdutoCampo not found")));
    }

    private void apply(ProdutoCampo e, ProdutoCampoRequest r) {
        e.campoId = r.campoId();
        e.obrigatorio = r.obrigatorio();
        e.ordem = r.ordem();
    }

    private ProdutoCampoResponse toResponse(ProdutoCampo e) {
        return new ProdutoCampoResponse(e.id, e.campoId, e.obrigatorio, e.ordem);
    }
}
