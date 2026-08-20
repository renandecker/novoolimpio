package br.com.sol7.olimpio.educacao.tipoatividade;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class TipoAtividadeService {

    @Inject
    TipoAtividadeRepository repository;

    @CacheResult(cacheName = "tipo-atividade-cache")
    public Uni<List<TipoAtividadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoAtividadeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoAtividadeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoAtividade not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-atividade-cache")
    public Uni<TipoAtividadeResponse> create(TipoAtividadeRequest r) {
        var e = new TipoAtividade();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-atividade-cache")
    public Uni<TipoAtividadeResponse> update(Long id, TipoAtividadeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoAtividade not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-atividade-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoAtividade not found")));
    }

    private void apply(TipoAtividade e, TipoAtividadeRequest r) {
        e.descricao = r.descricao();
        e.cargaHorariaMaxima = r.cargaHorariaMaxima();
        e.cargaHorariaMinima = r.cargaHorariaMinima();
    }

    private TipoAtividadeResponse toResponse(TipoAtividade e) {
        return new TipoAtividadeResponse(e.id, e.descricao, e.cargaHorariaMaxima, e.cargaHorariaMinima);
    }
}

