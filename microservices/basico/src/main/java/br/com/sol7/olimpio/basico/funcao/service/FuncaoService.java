package br.com.sol7.olimpio.basico.funcao.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.funcao.dto.FuncaoRequest;
import br.com.sol7.olimpio.basico.funcao.dto.FuncaoResponse;
import br.com.sol7.olimpio.basico.funcao.entity.Funcao;
import br.com.sol7.olimpio.basico.funcao.repository.FuncaoRepository;

@ApplicationScoped
@WithTransaction
public class FuncaoService {

    @Inject
    FuncaoRepository repository;

    public Uni<List<FuncaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FuncaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FuncaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Funcao not found"))
                .map(this::toResponse);
    }

    public Uni<FuncaoResponse> create(FuncaoRequest r) {
        var e = new Funcao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FuncaoResponse> update(Long id, FuncaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Funcao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Funcao not found")));
    }

    private void apply(Funcao e, FuncaoRequest r) {
        e.descricao = r.descricao();
    }

    private FuncaoResponse toResponse(Funcao e) {
        return new FuncaoResponse(e.id, e.descricao);
    }
}
