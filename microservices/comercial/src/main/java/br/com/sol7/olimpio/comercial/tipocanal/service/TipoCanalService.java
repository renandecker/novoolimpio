package br.com.sol7.olimpio.comercial.tipocanal;

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
public class TipoCanalService {

    @Inject
    TipoCanalRepository repository;

    @CacheResult(cacheName = "tipo-canal-cache")
    public Uni<List<TipoCanalResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TipoCanalResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TipoCanalResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoCanal not found"))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-canal-cache")
    public Uni<TipoCanalResponse> create(TipoCanalRequest r) {
        var e = new TipoCanal();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    @CacheInvalidateAll(cacheName = "tipo-canal-cache")
    public Uni<TipoCanalResponse> update(Long id, TipoCanalRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TipoCanal not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    @CacheInvalidateAll(cacheName = "tipo-canal-cache")
    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TipoCanal not found")));
    }

    private void apply(TipoCanal e, TipoCanalRequest r) {
        e.descricao = r.descricao();
    }

    private TipoCanalResponse toResponse(TipoCanal e) {
        return new TipoCanalResponse(e.id, e.descricao);
    }


    // Migrado de TipoCanalService.buscarTipoCanalTelemarketing (src/main/java/br/com/sol7/olimpio/service/services/comercial/TipoCanalService.java:25, camada service)
    // Observacao: retorno: era Optional<TipoCanal> no legado
    // Logica original (adaptar):
    // public Optional<TipoCanal> buscarTipoCanalTelemarketing() {
    //         return getBaseRepository().findById(4);
    //     }
    public Uni<String> buscarTipoCanalTelemarketing() {
        return repository.findById(4L).map(x -> x == null ? null : x.descricao);
    }


    // Migrado de TipoCanalService.buscarTipoCanalEmailmarketing (src/main/java/br/com/sol7/olimpio/service/services/comercial/TipoCanalService.java:29, camada service)
    // Observacao: retorno: era Optional<TipoCanal> no legado
    // Logica original (adaptar):
    // public Optional<TipoCanal> buscarTipoCanalEmailmarketing() {
    //         return getBaseRepository().findById(5);
    //     }
    public Uni<String> buscarTipoCanalEmailmarketing() {
        return repository.findById(5L).map(x -> x == null ? null : x.descricao);
    }


    // Migrado de TipoCanalService.buscarTipoCanalMalaDireta (src/main/java/br/com/sol7/olimpio/service/services/comercial/TipoCanalService.java:33, camada service)
    // Observacao: retorno: era Optional<TipoCanal> no legado
    // Logica original (adaptar):
    // public Optional<TipoCanal> buscarTipoCanalMalaDireta() {
    //         return getBaseRepository().findById(6);
    //     }
    public Uni<String> buscarTipoCanalMalaDireta() {
        return repository.findById(6L).map(x -> x == null ? null : x.descricao);
    }

}
