package br.com.sol7.olimpio.estoque.solicitacaoestoque;

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

    @Inject SolicitacaoEstoqueRepository repository;

    public Uni<List<SolicitacaoEstoqueResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<SolicitacaoEstoqueResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<SolicitacaoEstoqueResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("SolicitacaoEstoque not found"))
                .map(this::toResponse);
    }

    public Uni<SolicitacaoEstoqueResponse> create(SolicitacaoEstoqueRequest r) {
        var e = new SolicitacaoEstoque();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
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
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<SolicitacaoEstoqueResponse> update(Long id, SolicitacaoEstoqueRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("SolicitacaoEstoque not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
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
}
