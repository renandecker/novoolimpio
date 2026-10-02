package br.com.sol7.olimpio.comercial.estrategia;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class EstrategiaService {

    @Inject
    EstrategiaRepository repository;

    public Uni<List<EstrategiaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EstrategiaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EstrategiaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Estrategia not found"))
                .map(this::toResponse);
    }

    public Uni<EstrategiaResponse> create(EstrategiaRequest r) {
        var e = new Estrategia();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EstrategiaResponse> update(Long id, EstrategiaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Estrategia not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Estrategia not found")));
    }

    private void apply(Estrategia e, EstrategiaRequest r) {
        e.descricao = r.descricao();
    }

    private EstrategiaResponse toResponse(Estrategia e) {
        return new EstrategiaResponse(e.id, e.descricao);
    }

    public Uni<List<Long>> autocomplete(String query) {
        if (query == null || query.isEmpty()) {
            return repository.listAll().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.autocomplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

}
