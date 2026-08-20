package br.com.sol7.olimpio.financeiro.boleto.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.financeiro.boleto.entity.Boleto;
import br.com.sol7.olimpio.financeiro.boleto.repository.BoletoRepository;
import br.com.sol7.olimpio.financeiro.boleto.dto.BoletoRequest;
import br.com.sol7.olimpio.financeiro.boleto.dto.BoletoResponse;

@ApplicationScoped
@WithTransaction
public class BoletoService {
    @Inject
    BoletoRepository repository;

    public Uni<List<BoletoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<BoletoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count().map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<BoletoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Boleto não encontrado")).map(this::toResponse);
    }

    public Uni<BoletoResponse> create(BoletoRequest r) {
        var e = new Boleto();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<BoletoResponse> update(Long id, BoletoRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("Boleto não encontrado")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("Boleto não encontrado")));
    }

    private void apply(Boleto e, BoletoRequest r) {
        e.movimentacaoId = r.movimentacaoId();
        e.barCode = r.barCode();
    }

    private BoletoResponse toResponse(Boleto e) {
        return new BoletoResponse(e.id, e.movimentacaoId, e.barCode);
    }
}
