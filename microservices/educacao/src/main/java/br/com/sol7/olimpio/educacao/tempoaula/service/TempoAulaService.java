package br.com.sol7.olimpio.educacao.tempoaula;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class TempoAulaService {

    @Inject TempoAulaRepository repository;

    public Uni<List<TempoAulaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TempoAulaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TempoAulaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TempoAula not found"))
                .map(this::toResponse);
    }

    public Uni<TempoAulaResponse> create(TempoAulaRequest r) {
        var e = new TempoAula();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TempoAulaResponse> update(Long id, TempoAulaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TempoAula not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TempoAula not found")));
    }

    private void apply(TempoAula e, TempoAulaRequest r) { e.descricao = r.descricao(); e.minutosAula = r.minutosAula(); e.minutos = r.minutos(); }

    private TempoAulaResponse toResponse(TempoAula e) {
        return new TempoAulaResponse(e.id, e.descricao, e.minutosAula, e.minutos);
    }
}
