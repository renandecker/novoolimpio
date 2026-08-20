package br.com.sol7.olimpio.financeiro.cheque.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.financeiro.cheque.entity.Cheque;
import br.com.sol7.olimpio.financeiro.cheque.repository.ChequeRepository;
import br.com.sol7.olimpio.financeiro.cheque.dto.ChequeRequest;
import br.com.sol7.olimpio.financeiro.cheque.dto.ChequeResponse;

@ApplicationScoped
@WithTransaction
public class ChequeService {
    @Inject
    ChequeRepository repository;

    public Uni<List<ChequeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ChequeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count().map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ChequeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Cheque não encontrado")).map(this::toResponse);
    }

    public Uni<ChequeResponse> create(ChequeRequest r) {
        var e = new Cheque();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ChequeResponse> update(Long id, ChequeRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Cheque não encontrado")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Cheque não encontrado")));
    }

    private void apply(Cheque e, ChequeRequest r) {
        e.movimentacaoId = r.movimentacaoId();
        e.data = r.data();
        e.numero = r.numero();
    }

    private ChequeResponse toResponse(Cheque e) {
        return new ChequeResponse(e.id, e.movimentacaoId, e.data, e.numero);
    }
}
