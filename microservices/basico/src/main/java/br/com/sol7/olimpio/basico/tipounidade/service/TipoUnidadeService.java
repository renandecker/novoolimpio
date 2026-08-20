package br.com.sol7.olimpio.basico.tipounidade.service;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.tipounidade.dto.TipoUnidadeRequest;
import br.com.sol7.olimpio.basico.tipounidade.dto.TipoUnidadeResponse;
import br.com.sol7.olimpio.basico.tipounidade.entity.TipoUnidade;
import br.com.sol7.olimpio.basico.tipounidade.repository.TipoUnidadeRepository;

@ApplicationScoped
@WithTransaction
public class TipoUnidadeService {

    @Inject
    TipoUnidadeRepository repository;

    @CacheResult(cacheName = "tipo-unidade-cache")
    public Uni<List<TipoUnidadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoUnidadeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoUnidadeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoUnidade not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-unidade-cache")
    public Uni<TipoUnidadeResponse> create(TipoUnidadeRequest r) {
        var e = new TipoUnidade();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-unidade-cache")
    public Uni<TipoUnidadeResponse> update(Long id, TipoUnidadeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoUnidade not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-unidade-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoUnidade not found")));
    }

    private void apply(TipoUnidade e, TipoUnidadeRequest r) {
        e.descricao = r.descricao();
    }

    private TipoUnidadeResponse toResponse(TipoUnidade e) {
        return new TipoUnidadeResponse(e.id, e.descricao);
    }
}
