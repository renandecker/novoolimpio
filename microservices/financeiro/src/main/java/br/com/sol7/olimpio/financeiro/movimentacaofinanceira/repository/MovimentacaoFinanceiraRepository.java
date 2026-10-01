package br.com.sol7.olimpio.financeiro.movimentacaofinanceira.repository;

import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;

import java.math.BigDecimal;
import java.util.List;

import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.MovimentacaoFinanceira;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento;

@ApplicationScoped
public class MovimentacaoFinanceiraRepository implements PanacheRepository<MovimentacaoFinanceira> {

    // select m from MovimentacaoFinanceira m where m.caixa = ?1 order by m.dataMovimento
    public Uni<List<MovimentacaoFinanceira>> buscarMovimentacaoCaixaDia(Long caixaId) {
        return find("caixaId = ?1 order by dataMovimento", caixaId).list();
    }

    // Migrado de CaixaController.totalRelatorio (legado) - totaliza, por forma de pagamento, as
    // movimentacoes de ENTRADA (id_tipo_movimento = 1) menos as de SAIDA (id_tipo_movimento = 2)
    // de um caixa, ja descontando o troco de pagamentos em dinheiro.
    private static final String SQL_TOTAL_POR_FORMA =
            "SELECT COALESCE(SUM(CASE WHEN tm.id = 1 THEN m.valor ELSE -m.valor END), 0) " +
                    "FROM fin_movimentacao m JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = ?1 AND m.forma_pagamento = ?2 AND tm.id in (1,2)";

    public Uni<BigDecimal> totalPorFormaPagamento(Long caixaId, TipoPagamento tipoPagamento) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TOTAL_POR_FORMA)
                        .setParameter(1, caixaId)
                        .setParameter(2, tipoPagamento.name())
                        .getSingleResult())
                .map(v -> v == null ? BigDecimal.ZERO : new BigDecimal(v.toString()));
    }

    // Migrado de CaixaController.totalRelatorio (legado) - soma do troco concedido em pagamentos
    // em dinheiro (entradas) do caixa.
    private static final String SQL_TOTAL_TROCO =
            "SELECT COALESCE(SUM(m.valor_troco), 0) FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = ?1 AND tm.id = 1";

    public Uni<BigDecimal> totalTroco(Long caixaId) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TOTAL_TROCO).setParameter(1, caixaId).getSingleResult())
                .map(v -> v == null ? BigDecimal.ZERO : new BigDecimal(v.toString()));
    }

    // Migrado de CaixaController.totalRelatorio (legado) - totais vinculados a pagamento de
    // parcela (id_parcela not null): valor bruto, desconto e multa/juros aplicados.
    private static final String SQL_TOTAIS_PARCELA =
            "SELECT COALESCE(SUM(m.valor), 0) AS valor, COALESCE(SUM(m.desconto), 0) AS desconto, COALESCE(SUM(m.multa_juros), 0) AS multa_juros " +
                    "FROM fin_movimentacao m WHERE m.id_caixa = ?1 AND m.id_parcela IS NOT NULL";

    public Uni<Tuple> totaisParcela(Long caixaId) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TOTAIS_PARCELA, Tuple.class).setParameter(1, caixaId).getResultList())
                .map(list -> {
                    if (list == null || list.isEmpty()) {
                        return null;
                    }
                    return (Tuple) list.get(0);
                });
    }

    // Migrado de CaixaController.buscarMovimentacaoCaixaEntrada (legado)
    // Busca apenas movimentações de ENTRADA (tipo_movimento = 1) de um caixa
    public static final String SQL_BUSCAR_MOVIMENTACAO_CAIXA_ENTRADA =
            "SELECT m.* FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = ?1 AND tm.id = 1 ORDER BY m.data_movimento";

    public Uni<List<MovimentacaoFinanceira>> buscarMovimentacaoCaixaEntrada(Long caixaId) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_MOVIMENTACAO_CAIXA_ENTRADA, MovimentacaoFinanceira.class)
                        .setParameter(1, caixaId)
                        .getResultList());
    }
}
