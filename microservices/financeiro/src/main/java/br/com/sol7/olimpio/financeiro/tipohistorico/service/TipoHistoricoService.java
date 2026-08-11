package br.com.sol7.olimpio.financeiro.tipohistorico;
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
public class TipoHistoricoService {

    @Inject TipoHistoricoRepository repository;

    @CacheResult(cacheName = "tipo-historico-cache")
    public Uni<List<TipoHistoricoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoHistoricoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoHistoricoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoHistorico not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-historico-cache")
    public Uni<TipoHistoricoResponse> create(TipoHistoricoRequest r) {
        var e = new TipoHistorico();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-historico-cache")
    public Uni<TipoHistoricoResponse> update(Long id, TipoHistoricoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoHistorico not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-historico-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoHistorico not found")));
    }

    private void apply(TipoHistorico e, TipoHistoricoRequest r) { e.descricao = r.descricao(); }

    private TipoHistoricoResponse toResponse(TipoHistorico e) {
        return new TipoHistoricoResponse(e.id, e.descricao);
    }
}
