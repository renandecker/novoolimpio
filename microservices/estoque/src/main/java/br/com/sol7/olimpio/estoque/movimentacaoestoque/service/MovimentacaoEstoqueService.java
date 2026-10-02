package br.com.sol7.olimpio.estoque.movimentacaoestoque;

import br.com.sol7.olimpio.estoque.controleestoque.ControleEstoque;
import br.com.sol7.olimpio.estoque.controleestoque.ControleEstoqueRepository;
import br.com.sol7.olimpio.estoque.produto.ProdutoRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.enums.TipoMovimentacao;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class MovimentacaoEstoqueService {

    @Inject
    MovimentacaoEstoqueRepository repository;
    @Inject
    ControleEstoqueRepository controleEstoqueRepository;
    @Inject
    ProdutoRepository produtoRepository;

    public Uni<List<MovimentacaoEstoqueResponse>> list() {
        return repository.listAll().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<PagedResponse<MovimentacaoEstoqueResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> {
                            var responses = items.stream().map(this::toResponse).toList();
                            return new PagedResponse<>(responses, count, p, s);
                        }));
    }

    public Uni<List<MovimentacaoEstoqueResponse>> listByUnidade(Long unidadeId) {
        return repository.find("unidadeId = ?1 order by id desc", unidadeId).list().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<MovimentacaoEstoqueResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MovimentacaoEstoque not found"))
                .map(this::toResponse);
    }

    public Uni<MovimentacaoEstoqueResponse> create(MovimentacaoEstoqueRequest r) {
        var e = new MovimentacaoEstoque();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    // Forca tipo ENTRADA, data do movimento atual, central=false e soma a quantidade no ControleEstoque da unidade/produto.
    public Uni<MovimentacaoEstoqueResponse> saveOrUpdate(MovimentacaoEstoqueRequest r) {
        var e = new MovimentacaoEstoque();
        apply(e, r);
        e.tipoMovimentacao = TipoMovimentacao.ENTRADA;
        e.central = false;
        if (e.dataMovimento == null) {
            e.dataMovimento = new Date();
        }
        return repository.persist(e).chain(() -> sumToControleEstoque(e).replaceWith(() -> toResponse(e)));
    }

    private Uni<Void> sumToControleEstoque(MovimentacaoEstoque e) {
        return controleEstoqueRepository.buscarExistenciaProduto(e.unidadeId, e.produtoId)
                .chain(list -> {
                    if (list == null || list.isEmpty()) {
                        var ce = new ControleEstoque();
                        ce.valor = e.valor;
                        ce.quantidade = e.quantidade;
                        ce.produtoId = e.produtoId;
                        ce.unidadeId = e.unidadeId;
                        return controleEstoqueRepository.persist(ce).replaceWithVoid();
                    }
                    var ce = list.get(0);
                    ce.quantidade = ce.quantidade + e.quantidade;
                    if (ce.valor == null) {
                        ce.valor = e.valor;
                    }
                    return controleEstoqueRepository.persist(ce).replaceWithVoid();
                });
    }

    public Uni<MovimentacaoEstoqueResponse> update(Long id, MovimentacaoEstoqueRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MovimentacaoEstoque not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    // Entrada de produto do centro de distribuição para a unidade
    // Registra movimentacao ENTRADA, central=true, subtrai do estoque central e soma no estoque da unidade
    public Uni<MovimentacaoEstoqueResponse> entradaCentral(MovimentacaoEstoqueRequest r) {
        var e = new MovimentacaoEstoque();
        apply(e, r);
        e.tipoMovimentacao = TipoMovimentacao.ENTRADA;
        e.central = true;
        if (e.dataMovimento == null) {
            e.dataMovimento = new Date();
        }
        return repository.persist(e).chain(() -> sumToControleEstoque(e).replaceWith(() -> toResponse(e)));
    }

    // Saida de produto da unidade para o centro de distribuição
    // Registra movimentacao SAIDA, central=true, subtrai do estoque da unidade e soma no estoque central
    public Uni<MovimentacaoEstoqueResponse> saidaCentral(MovimentacaoEstoqueRequest r) {
        var e = new MovimentacaoEstoque();
        apply(e, r);
        e.tipoMovimentacao = TipoMovimentacao.SAIDA;
        e.central = true;
        if (e.dataMovimento == null) {
            e.dataMovimento = new Date();
        }
        return repository.persist(e).chain(() -> subtractFromControleEstoque(e).replaceWith(() -> toResponse(e)));
    }

    private Uni<Void> subtractFromControleEstoque(MovimentacaoEstoque e) {
        return controleEstoqueRepository.buscarExistenciaProduto(e.unidadeId, e.produtoId)
                .chain(list -> {
                    if (list == null || list.isEmpty()) {
                        return Uni.createFrom().voidItem();
                    }
                    var ce = list.get(0);
                    ce.quantidade = Math.max(0, ce.quantidade - e.quantidade);
                    return controleEstoqueRepository.persist(ce).replaceWithVoid();
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MovimentacaoEstoque not found")));
    }

    private void apply(MovimentacaoEstoque e, MovimentacaoEstoqueRequest r) {
        e.valor = r.valor();
        e.quantidade = r.quantidade();
        e.tipoMovimentacao = r.tipoMovimentacao();
        e.dataMovimento = r.dataMovimento();
        e.usuarioId = r.usuarioId();
        e.produtoId = r.produtoId();
        e.unidadeId = r.unidadeId();
        e.vendaProdutoId = r.vendaProdutoId();
        e.unidadeCentralId = r.unidadeCentralId();
        e.fornecedorId = r.fornecedorId();
        e.central = r.central();
    }

    private MovimentacaoEstoqueResponse toResponse(MovimentacaoEstoque e) {
        return new MovimentacaoEstoqueResponse(e.id, e.valor, e.quantidade, e.tipoMovimentacao, e.dataMovimento, e.usuarioId, e.produtoId, e.unidadeId, e.vendaProdutoId, e.unidadeCentralId, e.fornecedorId, e.central);
    }

    private Uni<MovimentacaoEstoqueResponse> enrichSingleResponse(MovimentacaoEstoqueResponse r) {
        if (r.produtoId() == null) return Uni.createFrom().item(r);
        return produtoRepository.findById(r.produtoId())
                .map(produto -> {
                    if (produto == null) return r;
                    return new MovimentacaoEstoqueResponse(
                            r.id(), r.valor(), r.quantidade(), r.tipoMovimentacao(), r.dataMovimento(),
                            r.usuarioId(), r.produtoId(), r.unidadeId(), r.vendaProdutoId(),
                            r.unidadeCentralId(), r.fornecedorId(), r.central(),
                            produto.nome, null, null
                    );
                });
    }

    private Uni<List<MovimentacaoEstoqueResponse>> enrichResponses(List<MovimentacaoEstoqueResponse> responses) {
        if (responses.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        List<Uni<MovimentacaoEstoqueResponse>> unis = responses.stream().map(this::enrichSingleResponse).toList();
        return Uni.join().all(unis).andFailFast();
    }
}
