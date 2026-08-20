package br.com.sol7.olimpio.basico.tipoagenda.service;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.tipoagenda.dto.TipoAgendaRequest;
import br.com.sol7.olimpio.basico.tipoagenda.dto.TipoAgendaResponse;
import br.com.sol7.olimpio.basico.tipoagenda.entity.TipoAgenda;
import br.com.sol7.olimpio.basico.tipoagenda.repository.TipoAgendaRepository;

@ApplicationScoped
@WithTransaction
public class TipoAgendaService {

    @Inject
    TipoAgendaRepository repository;

    @CacheResult(cacheName = "tipo-agenda-cache")
    public Uni<List<TipoAgendaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoAgendaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoAgendaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoAgenda not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-agenda-cache")
    public Uni<TipoAgendaResponse> create(TipoAgendaRequest r) {
        var e = new TipoAgenda();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-agenda-cache")
    public Uni<TipoAgendaResponse> update(Long id, TipoAgendaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoAgenda not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-agenda-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoAgenda not found")));
    }

    private void apply(TipoAgenda e, TipoAgendaRequest r) {
        e.descricao = r.descricao();
        e.cor = r.cor();
    }

    private TipoAgendaResponse toResponse(TipoAgenda e) {
        return new TipoAgendaResponse(e.id, e.descricao, e.cor);
    }
}
