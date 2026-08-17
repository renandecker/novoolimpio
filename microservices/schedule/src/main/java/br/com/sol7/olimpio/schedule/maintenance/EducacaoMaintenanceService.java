package br.com.sol7.olimpio.schedule.maintenance;

import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.sqlclient.Pool;
import io.vertx.mutiny.sqlclient.Row;
import io.vertx.mutiny.sqlclient.RowSet;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Rotinas do dominio "educacao" migradas de SchedulingService (TaxaCursoService,
 * DescontoCursoService, limpeza de cancelamento de contrato vencido, correcao de
 * avaliacoes e carregamento de chamadas pendentes). Todas as consultas usam
 * o pool padrao do banco compartilhado.
 */
@ApplicationScoped
public class EducacaoMaintenanceService {

    private static final Logger LOG = Logger.getLogger(EducacaoMaintenanceService.class);

    @Inject
    Pool pool;

    // ---------------------------------------------------------------------------
    // CotaTaxoCurso
    // ---------------------------------------------------------------------------

    private static final String[] SQL_VERIFICAR_COTA_TAXA_CURSO = {
            "UPDATE edc_taxa_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date",
            "UPDATE edc_taxa_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))",
            "UPDATE edc_taxa_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' and " +
                    "date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)",
    };

    public Uni<Void> verificarCotaTaxaCurso() {
        return executeAll(SQL_VERIFICAR_COTA_TAXA_CURSO);
    }

    // ---------------------------------------------------------------------------
    // DescontoCurso
    // ---------------------------------------------------------------------------

    private static final String[] SQL_VERIFICAR_COTA_DESCONTO_CURSO = {
            "UPDATE edc_desconto_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date",
            "UPDATE edc_desconto_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
                    "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))",
            "UPDATE edc_desconto_curso taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
                    "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' and " +
                    "date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)",
    };

    public Uni<Void> verificarCotaDescontoCurso() {
        return executeAll(SQL_VERIFICAR_COTA_DESCONTO_CURSO);
    }

    private Uni<Void> executeAll(String[] sqls) {
        Uni<Void> chain = Uni.createFrom().voidItem();
        for (String sql : sqls) {
            chain = chain.chain(() -> pool.query(sql).execute().replaceWithVoid());
        }
        return chain;
    }

    // ---------------------------------------------------------------------------
    // Cancelamento de contrato vencido
    // ---------------------------------------------------------------------------

    private static final String SQL_LIMPAR_CANCELAMENTO_CONTRATO_VENCIDO =
            "UPDATE edc_contrato SET data_cancelamento = null where ativo = true and data_cancelamento < current_date";

    public Uni<Void> limparCancelamentoContratoVencido() {
        return pool.query(SQL_LIMPAR_CANCELAMENTO_CONTRATO_VENCIDO).execute().replaceWithVoid();
    }

    // ---------------------------------------------------------------------------
    // Replicacao de oferecimento (permanece no servico dono da regra)
    // ---------------------------------------------------------------------------

    public Uni<Void> replicarOferecimentoAutomatico() {
        return Uni.createFrom().voidItem();
    }

    // ---------------------------------------------------------------------------
    // Carregar chamadas assinadas pendentes automaticamente
    // Migrado de ChamadaAssinadaImpressaService.carregarChamadasPendentes() (legado).
    //
    // Logica:
    // 1. Busca todos os oferecimentos_componente_curricular que NAO possuem
    //    registro em edc_chamada_assinada_impressa e cujo status e LIBERADA ou EM_ANDAMENTO.
    // 2. Para cada oferecimento encontrado, gera as chamadas assinadas pendentes
    //    dividindo as aulas conforme o qtde_sequencia do oferecimento.
    // 3. Gera tambem chamadas coringa (aulas extras) quando existirem.
    // ---------------------------------------------------------------------------

    private static final String SQL_OFERECIMENTOS_SEM_CHAMADA =
            "SELECT o.id, COALESCE(o.qtde_sequencia, 0) AS qtde_seq " +
            "FROM edc_oferecimento_componente_curricular o " +
            "WHERE NOT EXISTS (" +
            "  SELECT ch.id FROM edc_chamada_assinada_impressa ch " +
            "  WHERE ch.id_oferecimento_componente_curricular = o.id" +
            ") AND (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO')";

    private static final String SQL_OCORRENCIAS =
            "SELECT id, data FROM edc_ocorrencia_componente_curricular " +
            "WHERE id_oferecimento_componente_curricular = $1 AND tipo = $2 " +
            "ORDER BY data";

    private static final String SQL_MAIOR_SEQUENCIA =
            "SELECT MAX(sequencia) FROM edc_chamada_assinada_impressa " +
            "WHERE id_oferecimento_componente_curricular = $1 AND ativo = true";

    private static final String SQL_EXISTE_PENDENTE =
            "SELECT count(*) FROM edc_chamada_assinada_impressa " +
            "WHERE id_oferecimento_componente_curricular = $1 AND sequencia = $2 AND ativo = true";

    private static final String SQL_INSERIR_CHAMADA =
            "INSERT INTO edc_chamada_assinada_impressa " +
            "(data, id_oferecimento_componente_curricular, sequencia, quantidade, aula_coringa, ativo, inicio, fim, pendente) " +
            "VALUES (now(), $1, $2, 0, $3, true, $4, $5, true)";

    public Uni<Void> carregarChamadasPendentesAutomatico() {
        LOG.info("carregarChamadasPendentesAutomatico - iniciando");
        return pool.preparedQuery(SQL_OFERECIMENTOS_SEM_CHAMADA).execute()
                .onItem().transformToUni(rows -> {
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Row row : rows) {
                        long oId = row.getLong("id");
                        int qtdeSeq = row.getInteger("qtde_seq");
                        chain = chain.chain(() -> processarOferecimentoPendente(oId, qtdeSeq));
                    }
                    return chain;
                })
                .invoke(() -> LOG.info("carregarChamadasPendentesAutomatico - concluido"))
                .replaceWithVoid();
    }

    private Uni<Void> processarOferecimentoPendente(long oId, int qtdeSequencia) {
        if (qtdeSequencia <= 0) return Uni.createFrom().voidItem();

        return buscarOcorrencias(oId, "NORMAL")
                .chain(normais -> {
                    if (normais.isEmpty()) return Uni.createFrom().voidItem();
                    return gerarChamadasParaOferecimento(oId, qtdeSequencia, normais, false);
                })
                .chain(() -> buscarOcorrencias(oId, "EXTRA"))
                .chain(extras -> {
                    if (extras.isEmpty()) return Uni.createFrom().voidItem();
                    return gerarChamadasParaOferecimento(oId, qtdeSequencia, extras, true);
                })
                .replaceWithVoid();
    }

    private Uni<List<LocalDateTime[]>> buscarOcorrencias(long oId, String tipo) {
        return pool.preparedQuery(SQL_OCORRENCIAS)
                .execute(Tuple.tuple().addLong(oId).addString(tipo))
                .onItem().transform(rows -> {
                    List<LocalDateTime[]> result = new ArrayList<>();
                    for (Row r : rows) {
                        LocalDateTime data = r.getLocalDateTime("data");
                        if (data != null) {
                            result.add(new LocalDateTime[]{data});
                        }
                    }
                    return result;
                });
    }

    private Uni<Void> gerarChamadasParaOferecimento(long oId, int qtdeSequencia, List<LocalDateTime[]> ocorrencias, boolean coringa) {
        int size = ocorrencias.size();
        int dividido = (size + qtdeSequencia - 1) / qtdeSequencia;

        Uni<Void> chain = Uni.createFrom().voidItem();
        for (int limite = 0; limite < dividido; limite++) {
            final int sequencia = limite + 1;
            int inicioIdx = Math.min(qtdeSequencia * limite, size - 1);
            int fimIdx = Math.min(qtdeSequencia * (limite + 1), size) - 1;

            LocalDateTime inicio = ocorrencias.get(inicioIdx)[0];
            LocalDateTime fim = ocorrencias.get(Math.min(fimIdx, size - 1))[0];

            chain = chain.chain(() -> {
                return pool.preparedQuery(SQL_EXISTE_PENDENTE)
                        .execute(Tuple.tuple().addLong(oId).addInteger(sequencia))
                        .onItem().transformToUni(existRows -> {
                            Row first = existRows.iterator().hasNext() ? existRows.iterator().next() : null;
                            long count = first != null ? first.getLong(0) : 0;
                            if (count > 0) return Uni.createFrom().voidItem();
                            return pool.preparedQuery(SQL_INSERIR_CHAMADA)
                                    .execute(Tuple.tuple()
                                            .addLong(oId)
                                            .addInteger(sequencia)
                                            .addBoolean(coringa)
                                            .addLocalDateTime(inicio)
                                            .addLocalDateTime(fim))
                                    .replaceWithVoid();
                        });
            });
        }
        return chain;
    }

    // ---------------------------------------------------------------------------
    // Corrigir avaliacoes
    // Migrado de SchedulingService.desativarCorrigirAvaliacoes() (legado) +
    // AvaliacaoService.executaCorrecao() (legado).
    //
    // Logica:
    // 1. Ativa avaliacoes dentro da janela (data_inicial <= hoje <= data_final).
    // 2. Desativa avaliacoes fora da janela.
    // 3. Para todas as avaliacoes com data_final < hoje, corrige as respostas
    //    do aluno comparando com a resposta correta da pergunta.
    //    nota_acerto = percentual_questao (se acerto) ou 0 (se erro).
    //    percentual_correcao = percentual_questao (se acerto) ou 0 (se erro).
    // ---------------------------------------------------------------------------

    private static final String SQL_ATIVAR_AVALIACOES =
            "UPDATE edc_avaliacao SET fl_ativo = true WHERE fl_ativo = false " +
            "AND data_inicial <= current_date AND data_final >= current_date";

    private static final String SQL_DESATIVAR_AVALIACOES =
            "UPDATE edc_avaliacao SET fl_ativo = false WHERE fl_ativo = true " +
            "AND (data_inicial > current_date OR data_final < current_date)";

    private static final String SQL_AVALIACOES_PARA_CORRIGIR =
            "SELECT id FROM edc_avaliacao WHERE data_final < current_date AND data_final IS NOT NULL";

    private static final String SQL_CORRIGIR_RESPOSTAS =
            "UPDATE edc_avaliacao_aluno aa " +
            "SET nota_acerto = CASE " +
            "  WHEN aa.id_avaliacao_resposta = p.id_avaliacao_resposta THEN p.percentual_questao " +
            "  ELSE 0 " +
            "END, " +
            "percentual_correcao = CASE " +
            "  WHEN aa.id_avaliacao_resposta = p.id_avaliacao_resposta THEN p.percentual_questao " +
            "  ELSE 0 " +
            "END " +
            "FROM edc_avaliacao_pergunta p " +
            "WHERE aa.id_avaliacao_pergunta = p.id " +
            "AND aa.id_avaliacao = $1";

    public Uni<Void> corrigirAvaliacoes() {
        LOG.info("corrigirAvaliacoes - iniciando");
        return pool.query(SQL_ATIVAR_AVALIACOES).execute().replaceWithVoid()
                .chain(() -> pool.query(SQL_DESATIVAR_AVALIACOES).execute().replaceWithVoid())
                .chain(() -> corrigirRespostasAlunos())
                .invoke(() -> LOG.info("corrigirAvaliacoes - concluido"))
                .replaceWithVoid();
    }

    private Uni<Void> corrigirRespostasAlunos() {
        return pool.preparedQuery(SQL_AVALIACOES_PARA_CORRIGIR).execute()
                .onItem().transformToUni(rows -> {
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Row row : rows) {
                        long avaliacaoId = row.getLong("id");
                        chain = chain.chain(() -> {
                            LOG.debugf("corrigirAvaliacoes - corrigindo avaliacao %d", avaliacaoId);
                            return pool.preparedQuery(SQL_CORRIGIR_RESPOSTAS)
                                    .execute(Tuple.tuple().addLong(avaliacaoId))
                                    .onItem().transform(r -> {
                                        LOG.debugf("corrigirAvaliacoes - avaliacao %d: %d registro(s) corrigido(s)", avaliacaoId, r.rowCount());
                                        return (Void) null;
                                    });
                        });
                    }
                    return chain;
                })
                .replaceWithVoid();
    }
}
