package br.com.sol7.olimpio.estoque.produtocampoinformacao;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ProdutoCampoInformacaoService {

    @Inject
    ProdutoCampoInformacaoRepository repository;

    public Uni<List<ProdutoCampoInformacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProdutoCampoInformacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<List<ProdutoCampoInformacaoResponse>> listByProduto(Long produtoId) {
        return repository.listByProduto(produtoId).map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<ProdutoCampoInformacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ProdutoCampoInformacao not found"))
                .map(this::toResponse);
    }

    public Uni<ProdutoCampoInformacaoResponse> create(ProdutoCampoInformacaoRequest r) {
        var e = new ProdutoCampoInformacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProdutoCampoInformacaoResponse> update(Long id, ProdutoCampoInformacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ProdutoCampoInformacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ProdutoCampoInformacao not found")));
    }

    private void apply(ProdutoCampoInformacao e, ProdutoCampoInformacaoRequest r) {
        e.valor = r.valor();
        e.produtoId = r.produtoId();
        e.campoId = r.campoId();
    }

    private ProdutoCampoInformacaoResponse toResponse(ProdutoCampoInformacao e) {
        return new ProdutoCampoInformacaoResponse(e.id, e.valor, e.produtoId, e.campoId);
    }
}
