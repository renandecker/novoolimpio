package br.com.sol7.olimpio.basico.genero.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.genero.dto.GeneroRequest;
import br.com.sol7.olimpio.basico.genero.dto.GeneroResponse;
import br.com.sol7.olimpio.basico.genero.entity.Genero;
import br.com.sol7.olimpio.basico.genero.repository.GeneroRepository;

@ApplicationScoped
@WithTransaction
public class GeneroService {

    @Inject GeneroRepository repository;

    public Uni<List<GeneroResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GeneroResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<GeneroResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Genero not found"))
                .map(this::toResponse);
    }

    public Uni<GeneroResponse> create(GeneroRequest r) {
        var e = new Genero();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GeneroResponse> update(Long id, GeneroRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Genero not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Genero not found")));
    }

    private void apply(Genero e, GeneroRequest r) { e.descricao = r.descricao(); }

    private GeneroResponse toResponse(Genero e) {
        return new GeneroResponse(e.id, e.descricao);
    }
}
