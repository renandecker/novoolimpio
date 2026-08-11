package br.com.sol7.olimpio.estoque.pendenciavendaproduto;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class PendenciaVendaProdutoService {

    @Inject PendenciaVendaProdutoRepository repository;

    public Uni<List<PendenciaVendaProdutoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PendenciaVendaProdutoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PendenciaVendaProdutoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PendenciaVendaProduto not found"))
                .map(this::toResponse);
    }

    public Uni<PendenciaVendaProdutoResponse> create(PendenciaVendaProdutoRequest r) {
        var e = new PendenciaVendaProduto();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PendenciaVendaProdutoResponse> update(Long id, PendenciaVendaProdutoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PendenciaVendaProduto not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("PendenciaVendaProduto not found")));
    }

    // Migrado de EstoqueProdutoController.salvaPendenciaEntregue (legado): marca a data de entrega da pendencia
    public Uni<PendenciaVendaProdutoResponse> salvaPendenciaEntregue(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PendenciaVendaProduto not found"))
                .invoke(e -> {
                    e.dataEntrega = new Date();
                    repository.persist(e);
                })
                .map(this::toResponse);
    }

    // Migrado de PendenciaVendaProdutoService.buscaPendencias (legado)
    public Uni<List<PendenciaVendaProdutoResponse>> buscaPendencias(Long unidadeId) {
        return repository.buscaPendencias(unidadeId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<List<PendenciaVendaProdutoResponse>> listarPorUnidade(Long unidadeId) {
        return repository.listarPorUnidade(unidadeId).map(items -> items.stream().map(this::toResponse).toList());
    }

    private void apply(PendenciaVendaProduto e, PendenciaVendaProdutoRequest r) {
        e.quantidade = r.quantidade();
        e.vendaProdutoId = r.vendaProdutoId();
        e.produtoId = r.produtoId();
        e.dataEntrega = r.dataEntrega();
    }

    private PendenciaVendaProdutoResponse toResponse(PendenciaVendaProduto e) {
        return new PendenciaVendaProdutoResponse(e.id, e.quantidade, e.vendaProdutoId, e.produtoId, e.dataEntrega);
    }
}
