package br.com.sol7.olimpio.basico.gestaocontas.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.gestaocontas.dto.GestaoContasRequest;
import br.com.sol7.olimpio.basico.gestaocontas.dto.GestaoContasResponse;
import br.com.sol7.olimpio.basico.gestaocontas.entity.GestaoContas;
import br.com.sol7.olimpio.basico.gestaocontas.repository.GestaoContasRepository;

@ApplicationScoped
@WithTransaction
public class GestaoContasService {
    @Inject
    GestaoContasRepository repository;

    public Uni<List<GestaoContasResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GestaoContasResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GestaoContasResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GestaoContas not found")).map(this::toResponse);
    }

    public Uni<GestaoContasResponse> create(GestaoContasRequest r) {
        var e = new GestaoContas();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GestaoContasResponse> update(Long id, GestaoContasRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GestaoContas not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GestaoContas not found")));
    }

    private void apply(GestaoContas e, GestaoContasRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GestaoContasResponse toResponse(GestaoContas e) {
        return new GestaoContasResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<Void> ajustarSituacao(Long contaId) {
        return repository.ajustarSituacao(contaId);
    }


    public Uni<List<Long>> autoCompleteDiaSemana(String query) {
        return repository.findByDiaSemanaQuery(query);
    }

}