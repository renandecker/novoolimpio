package br.com.sol7.olimpio.relatorios.estruturacoluna;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class EstruturaColunaService {

    @Inject
    EstruturaColunaRepository repository;

    public Uni<List<EstruturaColunaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EstruturaColunaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<EstruturaColunaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EstruturaColuna not found"))
                .map(this::toResponse);
    }

    public Uni<EstruturaColunaResponse> create(EstruturaColunaRequest r) {
        var e = new EstruturaColuna();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EstruturaColunaResponse> update(Long id, EstruturaColunaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("EstruturaColuna not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("EstruturaColuna not found")));
    }

    private void apply(EstruturaColuna e, EstruturaColunaRequest r) {
        e.coluna = r.coluna();
        e.estruturaId = r.estruturaId();
    }

    private EstruturaColunaResponse toResponse(EstruturaColuna e) {
        return new EstruturaColunaResponse(e.id, e.coluna, e.estruturaId);
    }
}