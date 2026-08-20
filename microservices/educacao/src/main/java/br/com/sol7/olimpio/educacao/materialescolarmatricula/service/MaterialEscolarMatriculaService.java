package br.com.sol7.olimpio.educacao.materialescolarmatricula;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MaterialEscolarMatriculaService {

    @Inject
    MaterialEscolarMatriculaRepository repository;

    public Uni<List<MaterialEscolarMatriculaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MaterialEscolarMatriculaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<List<MaterialEscolarMatriculaResponse>> listByMatricula(Long matriculaId) {
        return repository.listByMatricula(matriculaId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<MaterialEscolarMatriculaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MaterialEscolarMatricula not found"))
                .map(this::toResponse);
    }

    public Uni<MaterialEscolarMatriculaResponse> create(MaterialEscolarMatriculaRequest r) {
        var e = new MaterialEscolarMatricula();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MaterialEscolarMatriculaResponse> update(Long id, MaterialEscolarMatriculaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MaterialEscolarMatricula not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MaterialEscolarMatricula not found")));
    }

    public Uni<Void> deleteByMatricula(Long matriculaId) {
        return repository.delete("matriculaId", matriculaId).replaceWithVoid();
    }

    private void apply(MaterialEscolarMatricula e, MaterialEscolarMatriculaRequest r) {
        e.controleEstoqueId = r.controleEstoqueId();
        e.matriculaId = r.matriculaId();
        e.quantidadeCurso = r.quantidadeCurso();
        e.quantidadeCompra = r.quantidadeCompra();
    }

    private MaterialEscolarMatriculaResponse toResponse(MaterialEscolarMatricula e) {
        return new MaterialEscolarMatriculaResponse(e.id, e.controleEstoqueId, e.matriculaId, e.quantidadeCurso, e.quantidadeCompra);
    }
}

