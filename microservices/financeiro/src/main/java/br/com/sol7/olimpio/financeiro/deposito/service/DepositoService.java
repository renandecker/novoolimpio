package br.com.sol7.olimpio.financeiro.deposito.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.financeiro.deposito.entity.Deposito;
import br.com.sol7.olimpio.financeiro.deposito.repository.DepositoRepository;
import br.com.sol7.olimpio.financeiro.deposito.dto.DepositoRequest;
import br.com.sol7.olimpio.financeiro.deposito.dto.DepositoResponse;

@ApplicationScoped
@WithTransaction
public class DepositoService {
    @Inject
    DepositoRepository repository;

    public Uni<List<DepositoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DepositoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count().map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<DepositoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Depósito não encontrado")).map(this::toResponse);
    }

    public Uni<DepositoResponse> create(DepositoRequest r) {
        var e = new Deposito();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DepositoResponse> update(Long id, DepositoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Depósito não encontrado")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Depósito não encontrado")));
    }

    private void apply(Deposito e, DepositoRequest r) {
        e.movimentacaoId = r.movimentacaoId();
        e.data = r.data();
        e.agenciaDestino = r.agenciaDestino();
        e.contaDestino = r.contaDestino();
    }

    private DepositoResponse toResponse(Deposito e) {
        return new DepositoResponse(e.id, e.movimentacaoId, e.data, e.agenciaDestino, e.contaDestino);
    }
}
