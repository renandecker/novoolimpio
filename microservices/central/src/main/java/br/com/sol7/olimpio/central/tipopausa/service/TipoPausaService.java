package br.com.sol7.olimpio.central.tipopausa;

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
public class TipoPausaService {

    @Inject
    TipoPausaRepository repository;

    @CacheResult(cacheName = "tipo-pausa-cache")
    public Uni<List<TipoPausaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoPausaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoPausaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoPausa not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-pausa-cache")
    public Uni<TipoPausaResponse> create(TipoPausaRequest r) {
        var e = new TipoPausa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-pausa-cache")
    public Uni<TipoPausaResponse> update(Long id, TipoPausaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoPausa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-pausa-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoPausa not found")));
    }

    private void apply(TipoPausa e, TipoPausaRequest r) {
        e.descricao = r.descricao();
        e.tempo = r.tempo();
    }

    private TipoPausaResponse toResponse(TipoPausa e) {
        return new TipoPausaResponse(e.id, e.descricao, e.tempo);
    }
}
