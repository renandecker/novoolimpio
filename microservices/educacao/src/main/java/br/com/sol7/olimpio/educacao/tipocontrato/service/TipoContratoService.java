package br.com.sol7.olimpio.educacao.tipocontrato;
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
public class TipoContratoService {

    @Inject TipoContratoRepository repository;

    @CacheResult(cacheName = "tipo-contrato-cache")
    public Uni<List<TipoContratoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoContratoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoContratoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoContrato not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-contrato-cache")
    public Uni<TipoContratoResponse> create(TipoContratoRequest r) {
        var e = new TipoContrato();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-contrato-cache")
    public Uni<TipoContratoResponse> update(Long id, TipoContratoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoContrato not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-contrato-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoContrato not found")));
    }

    private void apply(TipoContrato e, TipoContratoRequest r) { e.descricao = r.descricao(); }

    private TipoContratoResponse toResponse(TipoContrato e) {
        return new TipoContratoResponse(e.id, e.descricao);
    }
}
