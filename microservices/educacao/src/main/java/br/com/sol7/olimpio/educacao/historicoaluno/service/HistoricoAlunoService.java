package br.com.sol7.olimpio.educacao.historicoaluno;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class HistoricoAlunoService {

    @Inject
    HistoricoAlunoRepository repository;

    public Uni<List<HistoricoAlunoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<HistoricoAlunoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<HistoricoAlunoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("HistoricoAluno not found"))
                .map(this::toResponse);
    }

    public Uni<HistoricoAlunoResponse> create(HistoricoAlunoRequest r) {
        var e = new HistoricoAluno();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<HistoricoAlunoResponse> update(Long id, HistoricoAlunoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("HistoricoAluno not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("HistoricoAluno not found")));
    }

    private void apply(HistoricoAluno e, HistoricoAlunoRequest r) {
        e.descricao = r.descricao();
        e.usuarioId = r.usuarioId();
        e.alunoId = r.alunoId();
        e.dataRegistro = r.dataRegistro();
    }

    private HistoricoAlunoResponse toResponse(HistoricoAluno e) {
        return new HistoricoAlunoResponse(e.id, e.descricao, e.usuarioId, e.alunoId, e.dataRegistro);
    }


    public Uni<Long> buscarHistoricoAlunoComCompromissos(Long historico) {
        return repository.buscarHistoricoAlunoComCompromissos(historico).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}

