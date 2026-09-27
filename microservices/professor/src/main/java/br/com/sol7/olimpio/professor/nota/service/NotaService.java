package br.com.sol7.olimpio.professor.nota.service;

import br.com.sol7.olimpio.professor.nota.entity.Nota;
import br.com.sol7.olimpio.professor.nota.repository.NotaRepository;
import br.com.sol7.olimpio.professor.nota.dto.NotaRequest;
import br.com.sol7.olimpio.professor.nota.dto.NotaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.professor.shared.notificacao.NotificacaoEventProducer;

@ApplicationScoped
@WithTransaction
public class NotaService {
    @Inject
    NotaRepository repository;
    @Inject
    NotificacaoEventProducer notificacaoEventProducer;

    public Uni<List<NotaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<NotaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<NotaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Nota not found")).map(this::toResponse);
    }

    public Uni<NotaResponse> create(NotaRequest r) {
        var e = new Nota();
        apply(e, r);
        return repository.persist(e)
                .chain(persisted -> notificacaoEventProducer.enviar(null, "ALUNO", "ALTERACAO_NOTA",
                        "Nota lançada: " + persisted.nota,
                        "Houve alteração de nota.",
                        "/view/configuracao/notificacoes-aluno")
                        .replaceWith(() -> toResponse(persisted)));
    }

    public Uni<NotaResponse> update(Long id, NotaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Nota not found")).invoke(e -> apply(e, r))
                .chain(e -> notificacaoEventProducer.enviar(null, "ALUNO", "ALTERACAO_NOTA",
                        "Nota alterada: " + id,
                        "A nota #" + id + " foi alterada.",
                        "/view/configuracao/notificacoes-aluno")
                        .replaceWith(() -> toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Nota not found")));
    }

    private void apply(Nota e, NotaRequest r) {
        e.notaMatriculaId = r.notaMatriculaId();
        e.notaGrauId = r.notaGrauId();
        e.notaComponenteCurricularMatriculaId = r.notaComponenteCurricularMatriculaId();
        e.nota = r.nota();
        e.notaConceitoId = r.notaConceitoId();
        e.ordem = r.ordem();
    }

    private NotaResponse toResponse(Nota e) {
        return new NotaResponse(e.id, e.notaMatriculaId, e.notaGrauId, e.notaComponenteCurricularMatriculaId, e.nota, e.notaConceitoId, e.ordem);
    }

    public Uni<List<NotaResponse>> buscarPorNotaComponenteCurricularMatricula(Long notaComponenteCurricularMatriculaId) {
        return repository.findByNotaComponenteCurricularMatricula(notaComponenteCurricularMatriculaId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
