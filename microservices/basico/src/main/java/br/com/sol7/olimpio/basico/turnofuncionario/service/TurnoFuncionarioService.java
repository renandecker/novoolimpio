package br.com.sol7.olimpio.basico.turnofuncionario.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.turnofuncionario.dto.TurnoFuncionarioRequest;
import br.com.sol7.olimpio.basico.turnofuncionario.dto.TurnoFuncionarioResponse;
import br.com.sol7.olimpio.basico.turnofuncionario.entity.TurnoFuncionario;
import br.com.sol7.olimpio.basico.turnofuncionario.repository.TurnoFuncionarioRepository;

@ApplicationScoped
@WithTransaction
public class TurnoFuncionarioService {

    @Inject
    TurnoFuncionarioRepository repository;

    public Uni<List<TurnoFuncionarioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TurnoFuncionarioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<TurnoFuncionarioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoFuncionario not found"))
                .map(this::toResponse);
    }

    public Uni<TurnoFuncionarioResponse> create(TurnoFuncionarioRequest r) {
        var e = new TurnoFuncionario();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TurnoFuncionarioResponse> update(Long id, TurnoFuncionarioRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("TurnoFuncionario not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("TurnoFuncionario not found")));
    }

    private void apply(TurnoFuncionario e, TurnoFuncionarioRequest r) {
        e.descricao = r.descricao();
    }

    private TurnoFuncionarioResponse toResponse(TurnoFuncionario e) {
        return new TurnoFuncionarioResponse(e.id, e.descricao);
    }
}
