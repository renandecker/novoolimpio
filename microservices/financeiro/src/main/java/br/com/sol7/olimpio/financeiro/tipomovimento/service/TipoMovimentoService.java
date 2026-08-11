package br.com.sol7.olimpio.financeiro.tipomovimento;
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
public class TipoMovimentoService {

    @Inject TipoMovimentoRepository repository;

    @CacheResult(cacheName = "tipo-movimento-cache")
    public Uni<List<TipoMovimentoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoMovimentoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoMovimentoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoMovimento not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-movimento-cache")
    public Uni<TipoMovimentoResponse> create(TipoMovimentoRequest r) {
        var e = new TipoMovimento();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-movimento-cache")
    public Uni<TipoMovimentoResponse> update(Long id, TipoMovimentoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoMovimento not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-movimento-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoMovimento not found")));
    }

    private void apply(TipoMovimento e, TipoMovimentoRequest r) { e.descricao = r.descricao(); }

    private TipoMovimentoResponse toResponse(TipoMovimento e) {
        return new TipoMovimentoResponse(e.id, e.descricao);
    }
}
