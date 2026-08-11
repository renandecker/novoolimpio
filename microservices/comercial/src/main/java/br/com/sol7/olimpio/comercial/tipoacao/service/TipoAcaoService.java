package br.com.sol7.olimpio.comercial.tipoacao;
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
public class TipoAcaoService {

    @Inject TipoAcaoRepository repository;

    @CacheResult(cacheName = "tipo-acao-cache")
    public Uni<List<TipoAcaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoAcaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoAcaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoAcao not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-acao-cache")
    public Uni<TipoAcaoResponse> create(TipoAcaoRequest r) {
        var e = new TipoAcao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-acao-cache")
    public Uni<TipoAcaoResponse> update(Long id, TipoAcaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoAcao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-acao-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoAcao not found")));
    }

    private void apply(TipoAcao e, TipoAcaoRequest r) { e.descricao = r.descricao(); }

    private TipoAcaoResponse toResponse(TipoAcao e) {
        return new TipoAcaoResponse(e.id, e.descricao);
    }
}
