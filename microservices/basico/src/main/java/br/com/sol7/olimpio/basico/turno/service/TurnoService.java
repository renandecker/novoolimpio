package br.com.sol7.olimpio.basico.turno.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.turno.dto.TurnoRequest;
import br.com.sol7.olimpio.basico.turno.dto.TurnoResponse;
import br.com.sol7.olimpio.basico.turno.entity.Turno;
import br.com.sol7.olimpio.basico.turno.repository.TurnoRepository;

@ApplicationScoped
@WithTransaction
public class TurnoService {

    @Inject TurnoRepository repository;

    public Uni<List<TurnoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TurnoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TurnoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Turno not found"))
                .map(this::toResponse);
    }

    public Uni<TurnoResponse> create(TurnoRequest r) {
        var e = new Turno();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TurnoResponse> update(Long id, TurnoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Turno not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Turno not found")));
    }

    private void apply(Turno e, TurnoRequest r) { e.descricao = r.descricao(); }

    private TurnoResponse toResponse(Turno e) {
        return new TurnoResponse(e.id, e.descricao);
    }
}
