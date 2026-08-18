package br.com.sol7.olimpio.estoque.controleepedidos;

import br.com.sol7.olimpio.estoque.produto.ProdutoRepository;
import br.com.sol7.olimpio.estoque.solicitacaoestoque.repository.SolicitacaoEstoqueRepository;
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
public class ControlePedidosService {

    @Inject ControlePedidosRepository repository;
    @Inject ProdutoRepository produtoRepository;
    @Inject SolicitacaoEstoqueRepository solicitacaoEstoqueRepository;

    public Uni<List<ControlePedidosResponse>> list() {
        return repository.listAll().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<List<ControlePedidosResponse>> listByUnidade(Long unidadeId) {
        return repository.find("unidadeId = ?1", unidadeId).list().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<PagedResponse<ControlePedidosResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> {
                            var responses = items.stream().map(this::toResponse).toList();
                            return new PagedResponse<>(responses, count, p, s);
                        }));
    }

    public Uni<ControlePedidosResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControlePedidos not found"))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<ControlePedidosResponse> create(ControlePedidosRequest r) {
        var e = new ControlePedidos();
        apply(e, r);
        return repository.persist(e).chain(() -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<ControlePedidosResponse> update(Long id, ControlePedidosRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControlePedidos not found"))
                .invoke(e -> apply(e, r))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ControlePedidos not found")));
    }

    // Migrado de ControlePedidosService.listarPedidos (legado)
    public Uni<List<ControlePedidosResponse>> listarPedidos(Long unidadeId, Date inicio, Date fim) {
        return repository.listarPedidos(unidadeId, inicio, fim).chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    // Migrado de ControlePedidosService.listarPedidosSemEntrega (legado)
    public Uni<List<ControlePedidosResponse>> listarPedidosSemEntrega(Long unidadeId) {
        return repository.listarPedidosSemEntrega(unidadeId).chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    // Migrado de EstoqueProdutoController.itemAProvadoNaoEntregue (legado)
    public Uni<Long> countAprovadoNaoEntregue(Long unidadeId, Long produtoId) {
        return repository.buscaSolicitacaoEstoque(unidadeId, produtoId).map(list -> (long) list.size());
    }

    public Uni<List<ControlePedidosResponse>> listBySolicitacao(Long solicitacaoEstoqueId) {
        return repository.listBySolicitacao(solicitacaoEstoqueId).map(items -> items.stream().map(this::toResponse).toList());
    }

    private void apply(ControlePedidos e, ControlePedidosRequest r) {
        e.dataEntrega = r.dataEntrega();
        e.aprovado = r.aprovado();
        e.dataAprovacao = r.dataAprovacao();
        e.dataPrevisao = r.dataPrevisao();
        e.valor = r.valor();
        e.quantidade = r.quantidade();
        e.usuarioId = r.usuarioId();
        e.solicitacaoEstoqueId = r.solicitacaoEstoqueId();
        e.movimentacaoEstoqueId = r.movimentacaoEstoqueId();
        e.produtoId = r.produtoId();
        e.unidadeId = r.unidadeId();
    }

    private ControlePedidosResponse toResponse(ControlePedidos e) {
        return new ControlePedidosResponse(e.id, e.dataEntrega, e.aprovado, e.dataAprovacao, e.dataPrevisao, e.valor, e.quantidade, e.usuarioId, e.solicitacaoEstoqueId, e.movimentacaoEstoqueId, e.produtoId, e.unidadeId);
    }

    private Uni<ControlePedidosResponse> enrichSingleResponse(ControlePedidosResponse r) {
        Uni<String> produtoNome = r.produtoId() != null
            ? produtoRepository.findById(r.produtoId()).map(p -> p != null ? p.nome : null)
            : Uni.createFrom().item((String) null);
        Uni<String> produtoImagem = r.produtoId() != null
            ? produtoRepository.findById(r.produtoId()).map(p -> p != null ? p.imagem : null)
            : Uni.createFrom().item((String) null);

        return Uni.combine().all().unis(produtoNome, produtoImagem)
                .asTuple()
                .map(t -> new ControlePedidosResponse(
                    r.id(), r.dataEntrega(), r.aprovado(), r.dataAprovacao(), r.dataPrevisao(),
                    r.valor(), r.quantidade(), r.usuarioId(), r.solicitacaoEstoqueId(), r.movimentacaoEstoqueId(),
                    r.produtoId(), r.unidadeId(),
                    t.getItem1(), t.getItem2(), null, null, null, null, null, 0
                ));
    }

private Uni<List<ControlePedidosResponse>> enrichResponses(List<ControlePedidosResponse> responses) {
        List<Uni<ControlePedidosResponse>> unis = responses.stream().map(this::enrichSingleResponse).toList();
        return Uni.join().all(unis).andFailFast();
    }
}
