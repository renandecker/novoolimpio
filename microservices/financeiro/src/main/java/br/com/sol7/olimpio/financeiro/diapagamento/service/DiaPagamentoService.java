package br.com.sol7.olimpio.financeiro.diapagamento;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class DiaPagamentoService {

    @Inject DiaPagamentoRepository repository;

    public Uni<List<DiaPagamentoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<DiaPagamentoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<DiaPagamentoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("DiaPagamento not found"))
                .map(this::toResponse);
    }

    public Uni<DiaPagamentoResponse> create(DiaPagamentoRequest r) {
        var e = new DiaPagamento();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<DiaPagamentoResponse> update(Long id, DiaPagamentoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("DiaPagamento not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("DiaPagamento not found")));
    }

    private void apply(DiaPagamento e, DiaPagamentoRequest r) { e.dia = r.dia(); }

    private DiaPagamentoResponse toResponse(DiaPagamento e) {
        return new DiaPagamentoResponse(e.id, e.dia);
    }
}
