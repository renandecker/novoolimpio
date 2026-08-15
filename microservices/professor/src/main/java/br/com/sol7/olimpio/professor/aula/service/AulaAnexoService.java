package br.com.sol7.olimpio.professor.aula.service;

import br.com.sol7.olimpio.professor.aula.dto.AulaDtos.AulaAnexoRequest;
import br.com.sol7.olimpio.professor.aula.dto.AulaDtos.AulaAnexoResponse;
import br.com.sol7.olimpio.professor.aula.entity.AulaAnexo;
import br.com.sol7.olimpio.professor.aula.repository.AulaAnexoRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class AulaAnexoService {

    @Inject
    AulaAnexoRepository repository;

    public Uni<List<AulaAnexoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AulaAnexoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<List<AulaAnexoResponse>> anexosDaAula(Long aulaId) {
        return repository.anexosDaAula(aulaId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<AulaAnexoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AulaAnexo not found"))
                .map(this::toResponse);
    }

    public Uni<AulaAnexoResponse> create(AulaAnexoRequest r) {
        var e = new AulaAnexo();
        apply(e, r);
        return repository.persistAndFlush(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AulaAnexoResponse> update(Long id, AulaAnexoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("AulaAnexo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("AulaAnexo not found")));
    }

    private void apply(AulaAnexo e, AulaAnexoRequest r) {
        e.aulaId = r.aulaId();
        e.nome = r.nome();
        e.anexo = r.anexo();
        e.tipo = r.tipo();
    }

    private AulaAnexoResponse toResponse(AulaAnexo e) {
        return new AulaAnexoResponse(e.id, e.aulaId, e.nome, e.anexo, e.tipo);
    }
}
