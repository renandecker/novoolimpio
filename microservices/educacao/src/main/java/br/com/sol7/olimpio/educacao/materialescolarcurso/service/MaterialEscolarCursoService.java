package br.com.sol7.olimpio.educacao.materialescolarcurso;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MaterialEscolarCursoService {

    @Inject
    MaterialEscolarCursoRepository repository;

    public Uni<List<MaterialEscolarCursoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MaterialEscolarCursoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<List<MaterialEscolarCursoResponse>> listByCurriculo(Long curriculoId) {
        return repository.listByCurriculo(curriculoId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<MaterialEscolarCursoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MaterialEscolarCurso not found"))
                .map(this::toResponse);
    }

    public Uni<MaterialEscolarCursoResponse> create(MaterialEscolarCursoRequest r) {
        var e = new MaterialEscolarCurso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MaterialEscolarCursoResponse> update(Long id, MaterialEscolarCursoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MaterialEscolarCurso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MaterialEscolarCurso not found")));
    }

    public Uni<Void> deleteByCurriculo(Long curriculoId) {
        return repository.delete("curriculoId", curriculoId).replaceWithVoid();
    }

    private void apply(MaterialEscolarCurso e, MaterialEscolarCursoRequest r) {
        e.produtoId = r.produtoId();
        e.curriculoId = r.curriculoId();
        e.quantidade = r.quantidade();
    }

    private MaterialEscolarCursoResponse toResponse(MaterialEscolarCurso e) {
        return new MaterialEscolarCursoResponse(e.id, e.produtoId, e.curriculoId, e.quantidade);
    }
}

