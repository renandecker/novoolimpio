package br.com.sol7.olimpio.estoque.pendenciavendaproduto;

import br.com.sol7.olimpio.estoque.produto.ProdutoRepository;
import br.com.sol7.olimpio.estoque.vendaproduto.VendaProdutoRepository;
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

    @Inject
    PendenciaVendaProdutoRepository repository;
    @Inject
    ProdutoRepository produtoRepository;
    @Inject
    VendaProdutoRepository vendaProdutoRepository;

    public Uni<List<PendenciaVendaProdutoResponse>> list() {
        return repository.listAll().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<PagedResponse<PendenciaVendaProdutoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> {
                            var responses = items.stream().map(this::toResponse).toList();
                            return new PagedResponse<>(responses, count, p, s);
                        }));
    }

    public Uni<PendenciaVendaProdutoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PendenciaVendaProduto not found"))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<PendenciaVendaProdutoResponse> create(PendenciaVendaProdutoRequest r) {
        var e = new PendenciaVendaProduto();
        apply(e, r);
        return repository.persist(e).chain(() -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<PendenciaVendaProdutoResponse> update(Long id, PendenciaVendaProdutoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PendenciaVendaProduto not found"))
                .invoke(e -> apply(e, r))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("PendenciaVendaProduto not found")));
    }

    public Uni<PendenciaVendaProdutoResponse> salvaPendenciaEntregue(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PendenciaVendaProduto not found"))
                .invoke(e -> {
                    e.dataEntrega = new Date();
                    repository.persist(e);
                })
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<List<PendenciaVendaProdutoResponse>> buscaPendencias(Long unidadeId) {
        return repository.buscaPendencias(unidadeId).chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<List<PendenciaVendaProdutoResponse>> listarPorUnidade(Long unidadeId) {
        return repository.listarPorUnidade(unidadeId).chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
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

    private Uni<PendenciaVendaProdutoResponse> enrichSingleResponse(PendenciaVendaProdutoResponse r) {
        Uni<String> produtoNome = r.produtoId() != null
                ? produtoRepository.findById(r.produtoId()).map(p -> p != null ? p.nome : null)
                : Uni.createFrom().item((String) null);
        Uni<String> produtoImagem = r.produtoId() != null
                ? produtoRepository.findById(r.produtoId()).map(p -> p != null ? p.imagem : null)
                : Uni.createFrom().item((String) null);

        Uni<java.util.Date> vendaDataCompra = r.vendaProdutoId() != null
                ? vendaProdutoRepository.findById(r.vendaProdutoId()).map(v -> v != null ? v.dataCompra : null)
                : Uni.createFrom().item((java.util.Date) null);
        Uni<java.math.BigDecimal> vendaValor = r.vendaProdutoId() != null
                ? vendaProdutoRepository.findById(r.vendaProdutoId()).map(v -> v != null ? v.valor : null)
                : Uni.createFrom().item((java.math.BigDecimal) null);

        return Uni.combine().all().unis(produtoNome, produtoImagem, vendaDataCompra, vendaValor)
                .asTuple()
                .map(t -> new PendenciaVendaProdutoResponse(
                        r.id(), r.quantidade(), r.vendaProdutoId(), r.produtoId(), r.dataEntrega(),
                        t.getItem1(), t.getItem2(), null, t.getItem3(), t.getItem4()
                ));
    }

    private Uni<List<PendenciaVendaProdutoResponse>> enrichResponses(List<PendenciaVendaProdutoResponse> responses) {
        if (responses.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        List<Uni<PendenciaVendaProdutoResponse>> unis = responses.stream().map(this::enrichSingleResponse).toList();
        return Uni.join().all(unis).andFailFast();
    }
}
