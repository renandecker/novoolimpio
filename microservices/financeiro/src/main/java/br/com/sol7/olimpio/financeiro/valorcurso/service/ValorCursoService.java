package br.com.sol7.olimpio.financeiro.valorcurso;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ValorCursoService {

    private static final String TABELA_UNIDADE = "edc_valor_curso_unidade";
    private static final String COLUNA_UNIDADE = "id_unidade";
    private static final String TABELA_FORMA_PAGAMENTO = "edc_valor_curso_forma_pagamento";
    private static final String COLUNA_FORMA_PAGAMENTO = "id_forma_pagamento";
    private static final String TABELA_DESCONTO = "edc_valor_curso_desconto_curso";
    private static final String COLUNA_DESCONTO = "id_desconto_curso";
    private static final String TABELA_TAXA = "edc_valor_curso_taxa_curso";
    private static final String COLUNA_TAXA = "id_taxa_curso";

    @Inject
    ValorCursoRepository repository;

    public Uni<List<ValorCursoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ValorCursoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ValorCursoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ValorCurso not found"))
                .map(this::toResponse);
    }

    public Uni<ValorCursoResponse> create(ValorCursoRequest r) {
        var e = new ValorCurso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ValorCursoResponse> update(Long id, ValorCursoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ValorCurso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ValorCurso not found")));
    }

    public Uni<List<Integer>> listarUnidades(Long id) {
        return repository.listarVinculos(TABELA_UNIDADE, COLUNA_UNIDADE, id);
    }

    public Uni<Void> substituirUnidades(Long id, List<Integer> unidadeIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_UNIDADE, COLUNA_UNIDADE, id, unidadeIds));
    }

    public Uni<List<Integer>> listarFormasPagamento(Long id) {
        return repository.listarVinculos(TABELA_FORMA_PAGAMENTO, COLUNA_FORMA_PAGAMENTO, id);
    }

    public Uni<Void> substituirFormasPagamento(Long id, List<Integer> formaPagamentoIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_FORMA_PAGAMENTO, COLUNA_FORMA_PAGAMENTO, id, formaPagamentoIds));
    }

    public Uni<List<Integer>> listarDescontos(Long id) {
        return repository.listarVinculos(TABELA_DESCONTO, COLUNA_DESCONTO, id);
    }

    public Uni<Void> substituirDescontos(Long id, List<Integer> descontoIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_DESCONTO, COLUNA_DESCONTO, id, descontoIds));
    }

    public Uni<List<Integer>> listarTaxas(Long id) {
        return repository.listarVinculos(TABELA_TAXA, COLUNA_TAXA, id);
    }

    public Uni<Void> substituirTaxas(Long id, List<Integer> taxaIds) {
        return find(id).chain(() -> repository.substituirVinculos(TABELA_TAXA, COLUNA_TAXA, id, taxaIds));
    }

    private void apply(ValorCurso e, ValorCursoRequest r) {
        e.data = r.data();
        e.curriculoId = r.curriculoId();
        e.valor = r.valor();
        e.valorHora = r.valorHora();
        e.descontoCarne = r.descontoCarne();
        e.valorDescontoAluno = r.valorDescontoAluno();
        e.diasToleranciaMulta = r.diasToleranciaMulta();
        e.diasSpc = r.diasSpc();
        e.juros = r.juros();
        e.multa = r.multa();
        e.percDescJurMul = r.percDescJurMul();
        e.percDescValor = r.percDescValor();
        e.percValorMinEntrada = r.percValorMinEntrada();
        e.prazoParcEntrada = r.prazoParcEntrada();
        e.prazoParcSegunda = r.prazoParcSegunda();
        e.qtdeParcelas = r.qtdeParcelas();
        e.cobraRematricula = r.cobraRematricula();
    }

    private ValorCursoResponse toResponse(ValorCurso e) {
        return new ValorCursoResponse(e.id, e.data, e.curriculoId, e.valor, e.valorHora, e.descontoCarne,
                e.valorDescontoAluno, e.diasToleranciaMulta, e.diasSpc, e.juros, e.multa, e.percDescJurMul,
                e.percDescValor, e.percValorMinEntrada, e.prazoParcEntrada, e.prazoParcSegunda, e.qtdeParcelas,
                e.cobraRematricula);
    }
}
