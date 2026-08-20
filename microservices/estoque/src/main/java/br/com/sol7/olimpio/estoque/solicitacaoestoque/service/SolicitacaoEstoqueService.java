package br.com.sol7.olimpio.estoque.solicitacaoestoque;

import br.com.sol7.olimpio.estoque.solicitacaoestoque.repository.SolicitacaoEstoqueRepository;
import br.com.sol7.olimpio.estoque.produto.ProdutoRepository;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.enums.Motivo;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class SolicitacaoEstoqueService {

    @Inject
    SolicitacaoEstoqueRepository repository;
    @Inject
    ProdutoRepository produtoRepository;

    public Uni<List<SolicitacaoEstoqueResponse>> list() {
        return repository.listAll().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<List<SolicitacaoEstoqueResponse>> listByUnidade(Long unidadeId) {
        return repository.find("unidadeId = ?1", unidadeId).list().chain(items -> {
            var responses = items.stream().map(this::toResponse).toList();
            return enrichResponses(responses);
        });
    }

    public Uni<PagedResponse<SolicitacaoEstoqueResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> {
                            var responses = items.stream().map(this::toResponse).toList();
                            return new PagedResponse<>(responses, count, p, s);
                        }));
    }

    public Uni<SolicitacaoEstoqueResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("SolicitacaoEstoque not found"))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<SolicitacaoEstoqueResponse> create(SolicitacaoEstoqueRequest r) {
        var e = new SolicitacaoEstoque();
        apply(e, r);
        return repository.persist(e).chain(() -> enrichSingleResponse(toResponse(e)));
    }

    // Migrado de EstoqueProdutoController.solicitarItem/salvaSolicitacao (legado):
    // cria solicitacao ativa com data atual; motivo FALTA quando o controle nao tem estoque.
    public Uni<SolicitacaoEstoqueResponse> solicitarItem(SolicitacaoEstoqueRequest r) {
        var e = new SolicitacaoEstoque();
        apply(e, r);
        e.ativo = true;
        if (e.dataSolicitacao == null) {
            e.dataSolicitacao = new Date();
        }
        if (e.motivo == null) {
            e.motivo = Motivo.SOLICITADO;
        }
        return repository.persist(e).chain(() -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<SolicitacaoEstoqueResponse> update(Long id, SolicitacaoEstoqueRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("SolicitacaoEstoque not found"))
                .invoke(e -> apply(e, r))
                .chain(e -> enrichSingleResponse(toResponse(e)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("SolicitacaoEstoque not found")));
    }

    // Migrado de EstoqueProdutoController.itemDefeito/itemFalta/itemSoliciado/itemNaoEncontrado/itemReservado
    public Uni<Long> countPorItem(Long unidadeId, Long produtoId, Motivo motivo) {
        return repository.buscaPorItem(unidadeId, produtoId, motivo).map(list -> (long) list.size());
    }

    public Uni<Long> countPorUnidade(Long unidadeId, Motivo motivo) {
        return repository.countPorUnidadeMotivo(unidadeId, motivo);
    }

    private void apply(SolicitacaoEstoque e, SolicitacaoEstoqueRequest r) {
        e.valor = r.valor();
        e.quantidade = r.quantidade();
        e.vendaProdutoId = r.vendaProdutoId();
        e.usuarioId = r.usuarioId();
        e.produtoId = r.produtoId();
        e.unidadeId = r.unidadeId();
        e.dataSolicitacao = r.dataSolicitacao();
        e.ativo = r.ativo();
        e.motivo = r.motivo();
        e.idMotivo = r.idMotivo();
    }

    private SolicitacaoEstoqueResponse toResponse(SolicitacaoEstoque e) {
        return new SolicitacaoEstoqueResponse(e.id, e.valor, e.quantidade, e.vendaProdutoId, e.usuarioId, e.produtoId, e.unidadeId, e.dataSolicitacao, e.ativo, e.motivo, e.idMotivo);
    }

    private Uni<SolicitacaoEstoqueResponse> enrichSingleResponse(SolicitacaoEstoqueResponse r) {
        if (r.produtoId() == null) return Uni.createFrom().item(r);
        return produtoRepository.findById(r.produtoId())
                .map(produto -> {
                    if (produto == null) return r;
                    return new SolicitacaoEstoqueResponse(
                            r.id(), r.valor(), r.quantidade(), r.vendaProdutoId(), r.usuarioId(),
                            r.produtoId(), r.unidadeId(), r.dataSolicitacao(), r.ativo(), r.motivo(), r.idMotivo(),
                            produto.nome, produto.imagem, produto.valor, produto.quantidade,
                            null, null, null
                    );
                });
    }

    private Uni<List<SolicitacaoEstoqueResponse>> enrichResponses(List<SolicitacaoEstoqueResponse> responses) {
        List<Uni<SolicitacaoEstoqueResponse>> unis = responses.stream().map(this::enrichSingleResponse).toList();
        return Uni.join().all(unis).andFailFast();
    }
}
