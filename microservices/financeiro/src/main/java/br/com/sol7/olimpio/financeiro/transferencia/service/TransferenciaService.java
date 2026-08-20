package br.com.sol7.olimpio.financeiro.transferencia.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.financeiro.transferencia.entity.Transferencia;
import br.com.sol7.olimpio.financeiro.transferencia.repository.TransferenciaRepository;
import br.com.sol7.olimpio.financeiro.transferencia.dto.TransferenciaRequest;
import br.com.sol7.olimpio.financeiro.transferencia.dto.TransferenciaResponse;

@ApplicationScoped
@WithTransaction
public class TransferenciaService {
    @Inject
    TransferenciaRepository repository;

    public Uni<List<TransferenciaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<TransferenciaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count().map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<TransferenciaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Transferência não encontrada")).map(this::toResponse);
    }

    public Uni<TransferenciaResponse> create(TransferenciaRequest r) {
        var e = new Transferencia();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<TransferenciaResponse> update(Long id, TransferenciaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Transferência não encontrada")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Transferência não encontrada")));
    }

    private void apply(Transferencia e, TransferenciaRequest r) {
        e.movimentacaoId = r.movimentacaoId();
        e.data = r.data();
        e.agenciaOrigem = r.agenciaOrigem();
        e.contaOrigem = r.contaOrigem();
        e.agenciaDestino = r.agenciaDestino();
        e.contaDestino = r.contaDestino();
    }

    private TransferenciaResponse toResponse(Transferencia e) {
        return new TransferenciaResponse(e.id, e.movimentacaoId, e.data, e.agenciaOrigem, e.contaOrigem, e.agenciaDestino, e.contaDestino);
    }
}
