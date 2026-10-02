package br.com.sol7.olimpio.estoque.produto;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ProdutoService {

    @Inject
    ProdutoRepository repository;

    public Uni<List<ProdutoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProdutoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ProdutoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Produto not found"))
                .map(this::toResponse);
    }

    public Uni<ProdutoResponse> create(ProdutoRequest r) {
        var e = new Produto();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProdutoResponse> update(Long id, ProdutoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Produto not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Produto not found")));
    }

    private void apply(Produto e, ProdutoRequest r) {
        e.valor = r.valor();
        e.imagem = r.imagem();
        e.quantidade = r.quantidade();
        e.nome = r.nome();
        e.tamanho = r.tamanho();
        e.ativo = r.ativo();
        e.dataCadastro = r.dataCadastro();
        e.categoriaId = r.categoriaId();
        e.marcaId = r.marcaId();
    }

    private ProdutoResponse toResponse(Produto e) {
        return new ProdutoResponse(e.id, e.valor, e.imagem, e.quantidade, e.nome, e.tamanho, e.ativo, e.dataCadastro, e.categoriaId, e.marcaId);
    }


    // Migrado de ProdutoController.autoCompleteUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/estoque/ProdutoController.java:146, camada controller)
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteUnidade(String query) {
    //         if (!query.equals("")) {
    //             return unidadeService.autoCompleteComUnidades(query, unidadesUsuario);
    //         } else {
    //             return unidadeService.autoCompleteComCurriculoSemBusca(unidadesUsuario);
    //         }
    //     }
    public Uni<List<Long>> autoCompleteUnidade(String query) {
        // Obs: depende do microservico basico (Unidade) - unidadeService.autoCompleteComUnidades / autoCompleteComCurriculoSemBusca
        return Uni.createFrom().item(java.util.List.of());
    }

    @Inject
    br.com.sol7.olimpio.estoque.produtocampoinformacao.ProdutoCampoInformacaoService produtoCampoInformacaoService;

    public Uni<ProdutoCamposVisualizacaoResponse> carregarProspectoParaVisualizacao(Long entityId) {
        if (entityId == null) {
            return Uni.createFrom().item(new ProdutoCamposVisualizacaoResponse(null, java.util.List.of()));
        }
        return produtoCampoInformacaoService.listByProduto(entityId)
                .map(campos -> new ProdutoCamposVisualizacaoResponse(entityId, campos));
    }

    public Uni<ProdutoCamposVisualizacaoResponse> carregarDynaForm(Long entityId) {
        if (entityId == null) {
            return Uni.createFrom().item(new ProdutoCamposVisualizacaoResponse(null, java.util.List.of()));
        }
        return produtoCampoInformacaoService.listByProduto(entityId)
                .map(campos -> new ProdutoCamposVisualizacaoResponse(entityId, campos));
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarProduto(Integer produtoestoque) {
        return repository.buscarProdutoEstoque(produtoestoque).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> carregarCampos(Long livroId) {
        return repository.carregarCampos(livroId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> carregarUnidade(Long produtoId) {
        return repository.carregarUnidade(produtoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    public Uni<Long> carregarFornecedor(Long produtoId) {
        return repository.carregarFornecedor(produtoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}