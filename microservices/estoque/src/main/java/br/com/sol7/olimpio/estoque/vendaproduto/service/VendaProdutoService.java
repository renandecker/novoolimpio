package br.com.sol7.olimpio.estoque.vendaproduto;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class VendaProdutoService {

    @Inject VendaProdutoRepository repository;

    public Uni<List<VendaProdutoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<VendaProdutoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<VendaProdutoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("VendaProduto not found"))
                .map(this::toResponse);
    }

    public Uni<VendaProdutoResponse> create(VendaProdutoRequest r) {
        var e = new VendaProduto();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<VendaProdutoResponse> update(Long id, VendaProdutoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("VendaProduto not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("VendaProduto not found")));
    }

    private void apply(VendaProduto e, VendaProdutoRequest r) { e.dataCompra = r.dataCompra(); e.unidadeId = r.unidadeId(); e.usuarioId = r.usuarioId(); e.pessoaId = r.pessoaId(); e.tipoFormaPagamento = r.tipoFormaPagamento(); e.valor = r.valor(); e.formaPagamentoId = r.formaPagamentoId(); e.quantidade = r.quantidade(); }

    private VendaProdutoResponse toResponse(VendaProduto e) {
        return new VendaProdutoResponse(e.id, e.dataCompra, e.unidadeId, e.usuarioId, e.pessoaId, e.tipoFormaPagamento, e.valor, e.formaPagamentoId, e.quantidade);
    }


    // Migrado de VendaProdutoController.autoCompleteAluno (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/VendaProdutoController.java:159, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAluno(String query) {
    //         return contratoService.autoCompleteAluno(query);
    //     }
    public Uni<List<Long>> autoCompleteAluno(String query) {
        // Obs: depende do microservico educacao (Contrato) - contratoService.autoCompleteAluno
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de VendaProdutoController.carregarVendas (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/VendaProdutoController.java:282, camada controller)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public void carregarVendas(Unidade unidade) {
    //         produtoCompradoListCarinho = new ArrayList<>();
    //         controleEstoqueList = new ArrayList<>();
    //         produtoCompradoListFiltrada = new ArrayList<>();
    //         if (unidade != null) {
    //             configuracaoEstoque = configuracaoEstoqueService.buscarConfiguracaoComUnidadeUsuario(unidade);
    //             controleEstoqueList = controleEstoqueService.buscarItenUnidade(unidade);
    // 
    //             for (ControleEstoque controleEstoque : controleEstoqueList) {
    //                 ProdutoComprado produtoComprado = new ProdutoComprado();
    //                 produtoComprado.setControleEstoque(controleEstoque);
    //                 produtoComprado.setQuantidade(0);
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarVendas(Long unidadeId) {
        // Obs: logica de UI do controlador JSF legado (lista ProdutoComprado/carrinho), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de VendaProdutoController.buscarProduto (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/VendaProdutoController.java:494, camada controller)
    // Logica original (adaptar):
    // public void buscarProduto() {
    //         categoriaProdutos = new Categoria();
    //         if (codigoproduto != null) {
    //             ControleEstoque controleEstoque = controleEstoqueService.buscarProdutoEstoque(codigoproduto);
    //             this.controleEstoque = controleEstoque;
    //             produtoCompradoListFiltrada = new ArrayList<>();
    //             for (ProdutoComprado produtoComprado : produtoCompradoList) {
    //                 if (controleEstoque.getProduto().getId().equals(produtoComprado.getControleEstoque().getProduto().getId())) {
    //                     produtoCompradoListFiltrada.add(produtoComprado);
    //                 }
    //             }
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarProduto() {
        // Obs: logica de UI do controlador JSF legado (filtro por codigoproduto), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de VendaProdutoController.buscarFormasPagamento (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/VendaProdutoController.java:513, camada controller)
    // Logica original (adaptar):
    // public List<FormaPagamento> buscarFormasPagamento() {
    //         return formaPagamentoService.findAll();
    //     }
    public Uni<List<Long>> buscarFormasPagamento() {
        // Obs: depende do microservico financeiro (FormaPagamento) - formaPagamentoService.findAll
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de VendaProdutoController.autoCompleteProduto (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/VendaProdutoController.java:707, camada controller)
    // Logica original (adaptar):
    // public List<ControleEstoque> autoCompleteProduto(String query) {
    //         if (query.equals("")) {
    //             return controleEstoqueService.autoCompleteComUnidade(configuracaoEstoque.getUnidade());
    //         } else {
    //             return controleEstoqueService.autoComplete(query, configuracaoEstoque.getUnidade());
    //         }
    //     }
    public Uni<List<Long>> autoCompleteProduto(String query) {
        // Obs: depende da unidade da configuracaoEstoque (usuario logado) para escolher entre autoCompleteComUnidade e autoComplete
        return Uni.createFrom().item(java.util.List.of());
    }

}
