package br.com.sol7.olimpio.professor.nota.service;

import br.com.sol7.olimpio.professor.nota.entity.NotaGrau;
import br.com.sol7.olimpio.professor.nota.repository.NotaGrauRepository;
import br.com.sol7.olimpio.professor.nota.dto.NotaGrauRequest;
import br.com.sol7.olimpio.professor.nota.dto.NotaGrauResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class NotaGrauService {
    @Inject
    NotaGrauRepository repository;

    public Uni<List<NotaGrauResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<NotaGrauResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<NotaGrauResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("NotaGrau not found")).map(this::toResponse);
    }

    public Uni<NotaGrauResponse> create(NotaGrauRequest r) {
        var e = new NotaGrau();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<NotaGrauResponse> update(Long id, NotaGrauRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("NotaGrau not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("NotaGrau not found")));
    }

    private void apply(NotaGrau e, NotaGrauRequest r) {
        e.grauNotaId = r.grauNotaId();
        e.grauConceitoId = r.grauConceitoId();
        e.nome = r.nome();
        e.descricao = r.descricao();
    }

    private NotaGrauResponse toResponse(NotaGrau e) {
        return new NotaGrauResponse(e.id, e.grauNotaId, e.grauConceitoId, e.nome, e.descricao);
    }

    public Uni<List<NotaGrauResponse>> buscarPorGrauNota(Long grauNotaId) {
        return repository.findByGrauNota(grauNotaId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
