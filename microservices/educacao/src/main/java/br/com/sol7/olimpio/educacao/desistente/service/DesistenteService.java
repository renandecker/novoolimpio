package br.com.sol7.olimpio.educacao.desistente;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class DesistenteService {

    @Inject DesistenteRepository repository;

    public Uni<List<DesistenteResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DesistenteResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<DesistenteResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Desistente not found"))
                .map(this::toResponse);
    }

    public Uni<DesistenteResponse> create(DesistenteRequest r) {
        var e = new Desistente();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DesistenteResponse> update(Long id, DesistenteRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Desistente not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Desistente not found")));
    }

    private void apply(Desistente e, DesistenteRequest r) { e.descricao = r.descricao(); e.dataCriacao = r.dataCriacao(); e.pessoaFuncionarioId = r.pessoaFuncionarioId(); e.contratoId = r.contratoId(); e.motivoId = r.motivoId(); e.ativo = r.ativo(); }

    private DesistenteResponse toResponse(Desistente e) {
        return new DesistenteResponse(e.id, e.descricao, e.dataCriacao, e.pessoaFuncionarioId, e.contratoId, e.motivoId, e.ativo);
    }
}
