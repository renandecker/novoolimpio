package br.com.sol7.olimpio.educacao.tiposala;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class TipoSalaService {

    @Inject TipoSalaRepository repository;

    @CacheResult(cacheName = "tipo-sala-cache")
    public Uni<List<TipoSalaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoSalaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoSalaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoSala not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-sala-cache")
    public Uni<TipoSalaResponse> create(TipoSalaRequest r) {
        var e = new TipoSala();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-sala-cache")
    public Uni<TipoSalaResponse> update(Long id, TipoSalaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoSala not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-sala-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoSala not found")));
    }

    private void apply(TipoSala e, TipoSalaRequest r) { e.descricao = r.descricao(); }

    private TipoSalaResponse toResponse(TipoSala e) {
        return new TipoSalaResponse(e.id, e.descricao);
    }
}
