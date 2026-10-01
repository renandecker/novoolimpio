package br.com.sol7.olimpio.financeiro.valorproduto;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ValorProdutoService {

    private static final String TABELA_UNIDADE = "fin_valor_produto_unidade";
    private static final String COLUNA_UNIDADE = "id_unidade";
    private static final String TABELA_CURSO = "fin_valor_produto_curso";
    private static final String COLUNA_CURSO = "id_curriculo";
    private static final String TABELA_FORMA_PAGAMENTO = "fin_valor_produto_forma_pagamento";
    private static final String COLUNA_FORMA_PAGAMENTO = "id_forma_pagamento";

    @Inject
    ValorProdutoRepository repository;

    public Uni<List<ValorProdutoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ValorProdutoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ValorProdutoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ValorProduto not found"))
                .map(this::toResponse);
    }

    public Uni<ValorProdutoResponse> create(ValorProdutoRequest r) {
        var e = new ValorProduto();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ValorProdutoResponse> update(Long id, ValorProdutoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ValorProduto not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ValorProduto not found")));
    }

    private void apply(ValorProduto e, ValorProdutoRequest r) {
        e.vezes = r.vezes();
        e.juros = r.juros();
        e.desconto = r.desconto();
        e.multa = r.multa();
        e.diasSpc = r.diasSpc();
        e.diasToleranciaMulta = r.diasToleranciaMulta();
    }

    private ValorProdutoResponse toResponse(ValorProduto e) {
        return new ValorProdutoResponse(e.id, e.vezes, e.juros, e.desconto, e.multa, e.diasSpc, e.diasToleranciaMulta);
    }


    // Migrado de ValorProdutoService.buscarExistenciaEmVenda (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ValorProdutoService.java:22, camada service)
    // Observacao: parametro valorProdutoId: era ValorProduto (referencia por id)
    // JPQL original: select v from VendaProduto vp inner join vp.formaPagamento v where v = ?1
    // Logica original (adaptar):
    // public List<ValorProduto> buscarExistenciaEmVenda(ValorProduto valorProduto) {
    //         return getValorProdutoRepository().buscarExistenciaEmVenda(valorProduto);
    //     }
    public Uni<List<Long>> buscarExistenciaEmVenda(Long valorProdutoId) {
        return repository.buscarExistenciaEmVenda(valorProdutoId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Integer>> listarUnidades(Long id) {
        return repository.listarVinculos(TABELA_UNIDADE, COLUNA_UNIDADE, id);
    }

    public Uni<Void> substituirUnidades(Long id, List<Integer> unidadeIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_UNIDADE, COLUNA_UNIDADE, id, unidadeIds));
    }

    public Uni<List<Integer>> listarCursos(Long id) {
        return repository.listarVinculos(TABELA_CURSO, COLUNA_CURSO, id);
    }

    public Uni<Void> substituirCursos(Long id, List<Integer> cursoIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_CURSO, COLUNA_CURSO, id, cursoIds));
    }

    public Uni<List<Integer>> listarFormasPagamento(Long id) {
        return repository.listarVinculos(TABELA_FORMA_PAGAMENTO, COLUNA_FORMA_PAGAMENTO, id);
    }

    public Uni<Void> substituirFormasPagamento(Long id, List<Integer> formaPagamentoIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_FORMA_PAGAMENTO, COLUNA_FORMA_PAGAMENTO, id, formaPagamentoIds));
    }

    public Uni<List<ValorProdutoResponse>> buscarPorUnidadeCurso(Long unidadeId, Long curriculoId) {
        return repository.buscarPorUnidadeCurso(unidadeId, curriculoId).map(items -> items.stream().map(this::toResponse).toList());
    }

}
