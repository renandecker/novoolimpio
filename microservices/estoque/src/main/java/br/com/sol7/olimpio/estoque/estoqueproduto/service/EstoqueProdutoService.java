package br.com.sol7.olimpio.estoque.estoqueproduto;

import br.com.sol7.olimpio.estoque.controleestoque.ControleEstoqueRepository;
import br.com.sol7.olimpio.estoque.controleestoque.ControleEstoqueResponse;
import br.com.sol7.olimpio.estoque.controleepedidos.ControlePedidosService;
import br.com.sol7.olimpio.estoque.movimentacaoestoque.MovimentacaoEstoqueRequest;
import br.com.sol7.olimpio.estoque.movimentacaoestoque.MovimentacaoEstoqueService;
import br.com.sol7.olimpio.estoque.pendenciavendaproduto.PendenciaVendaProdutoService;
import br.com.sol7.olimpio.estoque.produto.ProdutoRepository;
import br.com.sol7.olimpio.estoque.solicitacaoestoque.SolicitacaoEstoqueRequest;
import br.com.sol7.olimpio.estoque.solicitacaoestoque.SolicitacaoEstoqueService;
import br.com.sol7.olimpio.shared.enums.Motivo;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class EstoqueProdutoService {

    @Inject
    ControleEstoqueRepository controleEstoqueRepository;
    @Inject
    MovimentacaoEstoqueService movimentacaoEstoqueService;
    @Inject
    SolicitacaoEstoqueService solicitacaoEstoqueService;
    @Inject
    ControlePedidosService controlePedidosService;
    @Inject
    PendenciaVendaProdutoService pendenciaVendaProdutoService;
    @Inject
    ProdutoRepository produtoRepository;

    public Uni<List<ControleEstoqueResponse>> listarControlePorUnidade(Long unidadeId) {
        return controleEstoqueRepository.buscarItenUnidade(unidadeId)
                .chain(items -> {
                    var responses = items.stream().map(ce -> new ControleEstoqueResponse(
                            ce.id, ce.valor, ce.quantidade, ce.qtdeSolicitado, ce.qtdeDefeito, ce.qtdeFalta,
                            ce.qtdeNaoEncontrado, ce.qtdeReservado, ce.qtdeAprovadoNaoEntregue, ce.produtoId, ce.unidadeId)).toList();
                    if (responses.isEmpty()) {
                        return Uni.createFrom().item(List.of());
                    }
                    List<Uni<ControleEstoqueResponse>> unis = responses.stream().map(this::enrichControleResponse).toList();
                    return Uni.join().all(unis).andCollectFailures();
                });
    }

    private Uni<ControleEstoqueResponse> enrichControleResponse(ControleEstoqueResponse r) {
        if (r.produtoId() == null) return Uni.createFrom().item(r);
        return produtoRepository.findById(r.produtoId())
                .map(produto -> {
                    if (produto == null) return r;
                    return new ControleEstoqueResponse(
                            r.id(), r.valor(), r.quantidade(), r.qtdeSolicitado(), r.qtdeDefeito(),
                            r.qtdeFalta(), r.qtdeNaoEncontrado(), r.qtdeReservado(), r.qtdeAprovadoNaoEntregue(),
                            r.produtoId(), r.unidadeId(),
                            produto.nome, produto.imagem, produto.valor, produto.quantidade,
                            null, null, null
                    );
                });
    }

    public Uni<Void> salvaEntrada(EstoqueProdutoEntradaRequest r) {
        var mov = new MovimentacaoEstoqueRequest(
                r.valor(), r.quantidade(), null, null, r.usuarioId(), r.produtoId(), r.unidadeId(),
                null, null, r.fornecedorId(), false);
        return movimentacaoEstoqueService.saveOrUpdate(mov).replaceWithVoid();
    }

    public Uni<Void> salvaSolicitacao(EstoqueProdutoSolicitacaoRequest r) {
        var sol = new SolicitacaoEstoqueRequest(
                r.valor(), r.quantidade(), r.vendaProdutoId(), r.usuarioId(), r.produtoId(), r.unidadeId(),
                null, true, r.motivo(), null);
        return solicitacaoEstoqueService.solicitarItem(sol).replaceWithVoid();
    }

    public Uni<Void> salvaPendenciaEntregue(Long pendenciaId) {
        return pendenciaVendaProdutoService.salvaPendenciaEntregue(pendenciaId).replaceWithVoid();
    }

    public boolean verificaEntregaPendencia(java.util.Date dataEntrega) {
        return dataEntrega == null;
    }

    public Uni<ContadoresEstoqueResponse> contadores(Long unidadeId, Long produtoId) {
        Uni<Long> solicitado = solicitacaoEstoqueService.countPorItem(unidadeId, produtoId, Motivo.SOLICITADO);
        Uni<Long> naoEncontrado = solicitacaoEstoqueService.countPorItem(unidadeId, produtoId, Motivo.NAOENCONTRATO);
        Uni<Long> falta = solicitacaoEstoqueService.countPorItem(unidadeId, produtoId, Motivo.FALTA);
        Uni<Long> defeito = solicitacaoEstoqueService.countPorItem(unidadeId, produtoId, Motivo.DEFEITO);
        Uni<Long> reservado = solicitacaoEstoqueService.countPorItem(unidadeId, produtoId, Motivo.RESERVADO);
        Uni<Long> aprovadoNaoEntregue = controlePedidosService.countAprovadoNaoEntregue(unidadeId, produtoId);
        return Uni.combine().all().unis(solicitado, naoEncontrado, falta, defeito, reservado, aprovadoNaoEntregue)
                .asTuple()
                .map(t -> new ContadoresEstoqueResponse(t.getItem1(), t.getItem2(), t.getItem3(), t.getItem4(), t.getItem5(), t.getItem6()));
    }

    public Uni<ValorCalculadoResponse> calcularValor(BigDecimal valor, int quantidade) {
        BigDecimal total = BigDecimal.ZERO;
        if (valor != null) {
            total = valor.multiply(BigDecimal.valueOf(quantidade));
        }
        return Uni.createFrom().item(new ValorCalculadoResponse(total));
    }
}
