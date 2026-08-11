package br.com.sol7.olimpio.estoque.controleepedidos;

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

    public Uni<List<ControlePedidosResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ControlePedidosResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ControlePedidosResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControlePedidos not found"))
                .map(this::toResponse);
    }

    public Uni<ControlePedidosResponse> create(ControlePedidosRequest r) {
        var e = new ControlePedidos();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ControlePedidosResponse> update(Long id, ControlePedidosRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ControlePedidos not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ControlePedidos not found")));
    }

    // Migrado de ControlePedidosService.listarPedidos (legado)
    public Uni<List<ControlePedidosResponse>> listarPedidos(Long unidadeId, Date inicio, Date fim) {
        return repository.listarPedidos(unidadeId, inicio, fim).map(items -> items.stream().map(this::toResponse).toList());
    }

    // Migrado de ControlePedidosService.listarPedidosSemEntrega (legado)
    public Uni<List<ControlePedidosResponse>> listarPedidosSemEntrega(Long unidadeId) {
        return repository.listarPedidosSemEntrega(unidadeId).map(items -> items.stream().map(this::toResponse).toList());
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
}
