package br.com.sol7.olimpio.professor.nota.service;

import br.com.sol7.olimpio.professor.nota.entity.NotaComponenteCurricularMatricula;
import br.com.sol7.olimpio.professor.nota.repository.NotaComponenteCurricularMatriculaRepository;
import br.com.sol7.olimpio.professor.nota.dto.NotaComponenteCurricularMatriculaRequest;
import br.com.sol7.olimpio.professor.nota.dto.NotaComponenteCurricularMatriculaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class NotaComponenteCurricularMatriculaService {
    @Inject
    NotaComponenteCurricularMatriculaRepository repository;

    public Uni<List<NotaComponenteCurricularMatriculaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<NotaComponenteCurricularMatriculaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<NotaComponenteCurricularMatriculaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("NotaComponenteCurricularMatricula not found")).map(this::toResponse);
    }

    public Uni<NotaComponenteCurricularMatriculaResponse> create(NotaComponenteCurricularMatriculaRequest r) {
        var e = new NotaComponenteCurricularMatricula();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<NotaComponenteCurricularMatriculaResponse> update(Long id, NotaComponenteCurricularMatriculaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("NotaComponenteCurricularMatricula not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("NotaComponenteCurricularMatricula not found")));
    }

    private void apply(NotaComponenteCurricularMatricula e, NotaComponenteCurricularMatriculaRequest r) {
        e.matriculaId = r.matriculaId();
        e.nota = r.nota();
        e.notaConceitoId = r.notaConceitoId();
        e.grauNotaId = r.grauNotaId();
        e.grauConceitoId = r.grauConceitoId();
    }

    private NotaComponenteCurricularMatriculaResponse toResponse(NotaComponenteCurricularMatricula e) {
        return new NotaComponenteCurricularMatriculaResponse(e.id, e.matriculaId, e.nota, e.notaConceitoId, e.grauNotaId, e.grauConceitoId);
    }

    public Uni<List<NotaComponenteCurricularMatriculaResponse>> buscarPorMatricula(Long matriculaId) {
        return repository.findByMatricula(matriculaId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
