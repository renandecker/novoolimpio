package br.com.sol7.olimpio.basico.tipotelefone.service;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.tipotelefone.dto.TipoTelefoneRequest;
import br.com.sol7.olimpio.basico.tipotelefone.dto.TipoTelefoneResponse;
import br.com.sol7.olimpio.basico.tipotelefone.entity.TipoTelefone;
import br.com.sol7.olimpio.basico.tipotelefone.repository.TipoTelefoneRepository;

@ApplicationScoped
@WithTransaction
public class TipoTelefoneService {

    @Inject
    TipoTelefoneRepository repository;

    @CacheResult(cacheName = "tipo-telefone-cache")
    public Uni<List<TipoTelefoneResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoTelefoneResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoTelefoneResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoTelefone not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-telefone-cache")
    public Uni<TipoTelefoneResponse> create(TipoTelefoneRequest r) {
        var e = new TipoTelefone();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-telefone-cache")
    public Uni<TipoTelefoneResponse> update(Long id, TipoTelefoneRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoTelefone not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-telefone-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoTelefone not found")));
    }

    private void apply(TipoTelefone e, TipoTelefoneRequest r) {
        e.descricao = r.descricao();
    }

    private TipoTelefoneResponse toResponse(TipoTelefone e) {
        return new TipoTelefoneResponse(e.id, e.descricao);
    }
}
