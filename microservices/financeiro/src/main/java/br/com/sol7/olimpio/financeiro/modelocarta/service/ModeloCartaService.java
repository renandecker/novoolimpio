package br.com.sol7.olimpio.financeiro.modelocarta;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ModeloCartaService {

    @Inject
    ModeloCartaRepository repository;

    public Uni<List<ModeloCartaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ModeloCartaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ModeloCartaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ModeloCarta not found"))
                .map(this::toResponse);
    }

    public Uni<ModeloCartaResponse> create(ModeloCartaRequest r) {
        var e = new ModeloCarta();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ModeloCartaResponse> update(Long id, ModeloCartaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ModeloCarta not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ModeloCarta not found")));
    }

    private void apply(ModeloCarta e, ModeloCartaRequest r) {
        e.descricao = r.descricao();
        e.localDocumento = r.localDocumento();
    }

    private ModeloCartaResponse toResponse(ModeloCarta e) {
        return new ModeloCartaResponse(e.id, e.descricao, e.localDocumento);
    }
}
