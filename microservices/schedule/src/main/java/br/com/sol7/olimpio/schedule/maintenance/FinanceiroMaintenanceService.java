package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.List;

/**
 * Rotinas do dominio "financeiro" migradas de SchedulingService (FormaPagamentoService,
 * fechamentoCaixaAbertos). Acessa "olimpio_financeiro" diretamente pelo datasource reativo
 * "financeiro-db" - sem chamada REST para o microsservico financeiro.
 */
@ApplicationScoped
public class FinanceiroMaintenanceService {

    @Inject
    Pool pool;

    // Migrado de FormaPagamentoService.verificarCotaAuto()
    private static final String SQL_VERIFICAR_COTA_DIARIO =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date";
    private static final String SQL_VERIFICAR_COTA_SEMANAL =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))";
    private static final String SQL_VERIFICAR_COTA_MENSAL =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' " +
                    "and date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)";

    public Uni<Void> verificarCotaFormaPagamento() {
        return pool.query(SQL_VERIFICAR_COTA_DIARIO).execute()
                .chain(r -> pool.query(SQL_VERIFICAR_COTA_SEMANAL).execute())
                .chain(r -> pool.query(SQL_VERIFICAR_COTA_MENSAL).execute())
                .replaceWithVoid();
    }

    // Migrado de SchedulingService.fechamentoCaixaAbertos()
    private static final String SQL_BUSCAR_CAIXAS_ABERTOS =
            "SELECT id, id_unidade FROM fin_caixa WHERE data_fechamento IS NULL";
    private static final String SQL_SOMAR_ENTRADAS =
            "SELECT COALESCE(SUM(m.valor), 0) AS total FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = $1 AND tm.id = 1";
    private static final String SQL_SOMAR_SAIDAS =
            "SELECT COALESCE(SUM(m.valor), 0) AS total FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = $1 AND tm.id = 2";
    private static final String SQL_SOMAR_SANGRIA =
            "SELECT COALESCE(SUM(valor), 0) AS total FROM fin_sangria WHERE id_caixa = $1";
    private static final String SQL_FECHAR_CAIXA =
            "UPDATE fin_caixa SET data_fechamento = now() WHERE id = $1";

    public record FechamentoCaixaResumo(Long caixaId, Long unidadeId, BigDecimal entradas,
                                         BigDecimal saidas, BigDecimal sangria) {}

    private record CaixaAberto(Long id, Long unidadeId) {}

    public Uni<List<FechamentoCaixaResumo>> fechamentoCaixaAbertos() {
        return pool.query(SQL_BUSCAR_CAIXAS_ABERTOS).execute()
                .map(rows -> {
                    List<CaixaAberto> caixas = new java.util.ArrayList<>();
                    for (Row row : rows) {
                        caixas.add(new CaixaAberto(row.getLong("id"), row.getLong("id_unidade")));
                    }
                    return caixas;
                })
                .chain(caixas -> {
                    List<Uni<FechamentoCaixaResumo>> unis = caixas.stream().map(this::fecharUmCaixa).toList();
                    return Uni.join().all(unis).andFailFast();
                });
    }

    private Uni<FechamentoCaixaResumo> fecharUmCaixa(CaixaAberto caixa) {
        Uni<BigDecimal> entradas = pool.preparedQuery(SQL_SOMAR_ENTRADAS).execute(Tuple.of(caixa.id()))
                .map(rows -> rows.iterator().next().getBigDecimal("total"));
        Uni<BigDecimal> saidas = pool.preparedQuery(SQL_SOMAR_SAIDAS).execute(Tuple.of(caixa.id()))
                .map(rows -> rows.iterator().next().getBigDecimal("total"));
        Uni<BigDecimal> sangria = pool.preparedQuery(SQL_SOMAR_SANGRIA).execute(Tuple.of(caixa.id()))
                .map(rows -> rows.iterator().next().getBigDecimal("total"));

        return Uni.combine().all().unis(entradas, saidas, sangria).asTuple()
                .chain(t -> pool.preparedQuery(SQL_FECHAR_CAIXA).execute(Tuple.of(caixa.id()))
                        .replaceWith(new FechamentoCaixaResumo(caixa.id(), caixa.unidadeId(), t.getItem1(), t.getItem2(), t.getItem3())));
        // Nota: o envio do e-mail de resumo (RotinaEnvioEmailController no legado) nao foi
        // portado - quem chamar este metodo recebe os valores calculados e decide o que fazer
        // (log, e-mail, etc). Ver RELATORIO_SCHEDULE.md.
    }

    // Migrado de CobrancaService.atualizaCobrancas() - processava em lote/paralelo
    // (TaskExecutorUtil) no legado; particionamento em threads nao portado automaticamente.
    public Uni<Void> atualizarCobrancasAutomatico() {
        // TODO: portar a regra de negocio (ver RELATORIO_SCHEDULE.md)
        return Uni.createFrom().voidItem();
    }
}
