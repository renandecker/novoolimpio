package br.com.sol7.olimpio.basico.tipocompromisso.service;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.tipocompromisso.dto.TipoCompromissoRequest;
import br.com.sol7.olimpio.basico.tipocompromisso.dto.TipoCompromissoResponse;
import br.com.sol7.olimpio.basico.tipocompromisso.entity.TipoCompromisso;
import br.com.sol7.olimpio.basico.tipocompromisso.repository.TipoCompromissoRepository;

@ApplicationScoped
@WithTransaction
public class TipoCompromissoService {

    @Inject TipoCompromissoRepository repository;

    @CacheResult(cacheName = "tipo-compromisso-cache")
    public Uni<List<TipoCompromissoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoCompromissoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoCompromissoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoCompromisso not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-compromisso-cache")
    public Uni<TipoCompromissoResponse> create(TipoCompromissoRequest r) {
        var e = new TipoCompromisso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-compromisso-cache")
    public Uni<TipoCompromissoResponse> update(Long id, TipoCompromissoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoCompromisso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-compromisso-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoCompromisso not found")));
    }

    private void apply(TipoCompromisso e, TipoCompromissoRequest r) { e.descricao = r.descricao(); }

    private TipoCompromissoResponse toResponse(TipoCompromisso e) {
        return new TipoCompromissoResponse(e.id, e.descricao);
    }
}
