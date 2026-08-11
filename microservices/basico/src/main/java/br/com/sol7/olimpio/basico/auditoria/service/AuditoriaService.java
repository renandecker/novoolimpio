package br.com.sol7.olimpio.basico.auditoria.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.auditoria.dto.AuditoriaRequest;
import br.com.sol7.olimpio.basico.auditoria.dto.AuditoriaResponse;
import br.com.sol7.olimpio.basico.auditoria.entity.Auditoria;
import br.com.sol7.olimpio.basico.auditoria.repository.AuditoriaRepository;

@ApplicationScoped
@WithTransaction
public class AuditoriaService {

    @Inject AuditoriaRepository repository;

    public Uni<List<AuditoriaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AuditoriaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<AuditoriaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Auditoria not found"))
                .map(this::toResponse);
    }

    public Uni<AuditoriaResponse> create(AuditoriaRequest r) {
        var e = new Auditoria();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AuditoriaResponse> update(Long id, AuditoriaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Auditoria not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Auditoria not found")));
    }

    private void apply(Auditoria e, AuditoriaRequest r) { e.username = r.username(); e.action = r.action(); }

    private AuditoriaResponse toResponse(Auditoria e) {
        return new AuditoriaResponse(e.id, e.username, e.action);
    }
}
