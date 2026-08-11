package br.com.sol7.olimpio.basico.etnia.service;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.etnia.dto.EtniaRequest;
import br.com.sol7.olimpio.basico.etnia.dto.EtniaResponse;
import br.com.sol7.olimpio.basico.etnia.entity.Etnia;
import br.com.sol7.olimpio.basico.etnia.repository.EtniaRepository;

@ApplicationScoped
@WithTransaction
public class EtniaService {

    @Inject EtniaRepository repository;

    public Uni<List<EtniaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<EtniaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<EtniaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Etnia not found"))
                .map(this::toResponse);
    }

    public Uni<EtniaResponse> create(EtniaRequest r) {
        var e = new Etnia();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<EtniaResponse> update(Long id, EtniaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Etnia not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Etnia not found")));
    }

    private void apply(Etnia e, EtniaRequest r) { e.descricao = r.descricao(); }

    private EtniaResponse toResponse(Etnia e) {
        return new EtniaResponse(e.id, e.descricao);
    }
}
