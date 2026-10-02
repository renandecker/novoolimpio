package br.com.sol7.olimpio.educacao.turma;

import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Tuple;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class TurmaRepository implements PanacheRepository<Turma> {

    // select c.id from CadernoComponenteCurricular c where c.matricula.contrato = ?1 and c.presenca = 'n'
    public static final String SQL_CADERNO_CHAMADA_PENDENTE_CONTRATO =
            "SELECT c.id FROM edc_caderno_componente_curricular c " +
                    "INNER JOIN edc_matricula m ON m.id = c.id_matricula " +
                    "WHERE m.id_contrato = ?1 AND c.presenca = 'n'";

    public Uni<List<Long>> buscarCadernoChamadaPendenteComContrato(Long contratoId) {
        if (contratoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_CADERNO_CHAMADA_PENDENTE_CONTRATO)
                        .setParameter(1, contratoId)
                        .getResultList())
                .map(list -> list.stream().map(TupleHelper::toLong).filter(java.util.Objects::nonNull).toList());
    }

    // percentualPresenca(Matricula): p = 1, m = 0.5; aulas = p, m, a, t, n
    public static final String SQL_PRESENCAS_MATRICULA =
            "SELECT c.id_matricula AS matricula_id, " +
                    " SUM(CASE WHEN c.presenca = 'p' THEN 1 WHEN c.presenca = 'm' THEN 0.5 ELSE 0 END) AS presencas, " +
                    " SUM(CASE WHEN c.presenca IN ('p','m','a','t','n') THEN 1 ELSE 0 END) AS aulas " +
                    "FROM edc_caderno_componente_curricular c WHERE c.id_matricula = ?1 GROUP BY c.id_matricula";

    public Uni<BigDecimal> percentualPresenca(Long matriculaId) {
        if (matriculaId == null) {
            return Uni.createFrom().item(BigDecimal.ZERO);
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_PRESENCAS_MATRICULA, Tuple.class)
                        .setParameter(1, matriculaId)
                        .getResultList())
                .map(rows -> {
                    if (rows == null || rows.isEmpty()) {
                        return BigDecimal.ZERO;
                    }
                    Object row = rows.get(0);
                    double aulas = Optional.ofNullable(TupleHelper.get(row, "aulas"))
                            .map(v -> new BigDecimal(String.valueOf(v)))
                            .map(BigDecimal::doubleValue)
                            .orElse(0d);
                    double presencas = Optional.ofNullable(TupleHelper.get(row, "presencas"))
                            .map(v -> new BigDecimal(String.valueOf(v)))
                            .map(BigDecimal::doubleValue)
                            .orElse(0d);
                    if (aulas == 0 || presencas == 0) {
                        return BigDecimal.ZERO;
                    }
                    return BigDecimal.valueOf((presencas / aulas) * 100);
                });
    }

    // select distinct a from NotaComponenteCurricularMatricula a left join fetch a.notas where a.matricula.oferecimentoComponenteCurricular = ?1
    public static final String SQL_NOTAS_OFERECIMENTO =
            "SELECT n.id_matricula AS matricula_id, n.id AS nota_id, n.nota AS nota, " +
                    " gn.numero_nota AS numero_nota, gn.peso AS peso, gnr.media_final AS media_final_grau_nota " +
                    "FROM edc_nota_componente_curricular_matricula n " +
                    "INNER JOIN edc_matricula m ON m.id = n.id_matricula " +
                    "LEFT JOIN edc_grau_nota gn ON gn.id = n.id_grau_nota " +
                    "LEFT JOIN edc_grau gnr ON gnr.id = gn.id_grau " +
                    "WHERE m.id_oferecimento_componente_curricular = ?1 AND n.nota IS NOT NULL";

    public Uni<List<Tuple>> notasDoOferecimento(Long oferecimentoComponenteCurricularId) {
        if (oferecimentoComponenteCurricularId == null) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_NOTAS_OFERECIMENTO, Tuple.class)
                        .setParameter(1, oferecimentoComponenteCurricularId)
                        .getResultList());
    }

    // select g from Grau g left join fetch g.grauNota n where g = ?1 order by n.numeroNota
    public static final String SQL_GRAU_NOTAS =
            "SELECT gn.id AS grau_nota_id, gn.numero_nota AS numero_nota, gn.peso AS peso, " +
                    " gnr.media_final AS media_final " +
                    "FROM edc_grau_nota gn LEFT JOIN edc_grau gnr ON gnr.id = gn.id_grau " +
                    "WHERE gn.id_grau = ?1 ORDER BY gn.numero_nota";

    public Uni<List<Tuple>> notasDoGrau(Long grauId) {
        if (grauId == null) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_GRAU_NOTAS, Tuple.class)
                        .setParameter(1, grauId)
                        .getResultList());
    }

    // FilterTrocaTurmaComMatricula: Predicate.equal(root.get("matricula"), matricula)
    public static final String SQL_TROCA_TURMA_MATRICULA =
            "SELECT t.id AS troca_turma_id, t.data AS data, t.id_usuario AS usuario_id, " +
                    " t.id_matricula AS matricula_id, " +
                    " t.id_oferecimento_componente_curricular_antes AS oferta_antes_id, " +
                    " t.id_oferecimento_componente_curricular_depois AS oferta_depois_id " +
                    "FROM edc_troca_turma t WHERE t.id_matricula = ?1 ORDER BY t.data";

    public Uni<List<Tuple>> trocasTurmaPorMatricula(Long matriculaId) {
        if (matriculaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TROCA_TURMA_MATRICULA, Tuple.class)
                        .setParameter(1, matriculaId)
                        .getResultList());
    }

    // FilterTrocaTurmaComContrato: TrocaTurma -> inner join Matricula -> inner join Contrato, contrato.id = ?1
    public static final String SQL_TROCA_TURMA_CONTRATO =
            "SELECT t.id AS troca_turma_id, t.data AS data, t.id_usuario AS usuario_id, " +
                    " t.id_matricula AS matricula_id, " +
                    " t.id_oferecimento_componente_curricular_antes AS oferta_antes_id, " +
                    " t.id_oferecimento_componente_curricular_depois AS oferta_depois_id " +
                    "FROM edc_troca_turma t " +
                    "INNER JOIN edc_matricula m ON m.id = t.id_matricula " +
                    "INNER JOIN edc_contrato con ON con.id = m.id_contrato " +
                    "WHERE con.id = ?1 ORDER BY t.data";

    public Uni<List<Tuple>> trocasTurmaPorContrato(Long contratoId) {
        if (contratoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_TROCA_TURMA_CONTRATO, Tuple.class)
                        .setParameter(1, contratoId)
                        .getResultList());
    }

    // CriterioService.corrigeCriterioDuplicadoPorunidadeCurso: apaga os criterios duplicados
    // (mesmo id_unidade + id_curriculo) mantendo apenas o criterio informado.
    public static final String[] SQL_CORRIGE_CRITERIO_DUPLICADO = {
            "DELETE FROM edc_criterio_dia_semana s WHERE s.id_criterio <> ?1 AND EXISTS " +
                    "(SELECT c.id FROM edc_criterio c WHERE c.id <> ?1 AND c.id_unidade = ?2 AND c.id_curriculo = ?3 AND c.id = s.id_criterio)",
            "DELETE FROM edc_criterio_turno s WHERE s.id_criterio <> ?1 AND EXISTS " +
                    "(SELECT c.id FROM edc_criterio c WHERE c.id <> ?1 AND c.id_unidade = ?2 AND c.id_curriculo = ?3 AND c.id = s.id_criterio)",
            "DELETE FROM edc_criterio WHERE id <> ?1 AND id_unidade = ?2 AND id_curriculo = ?3",
    };

    public Uni<Integer> corrigirCriterioDuplicado(Long criterioId, Long unidadeId, Long curriculoId) {
        return Panache.getSession()
                .flatMap(session -> {
                    Uni<Integer> total = Uni.createFrom().item(0);
                    for (String sql : SQL_CORRIGE_CRITERIO_DUPLICADO) {
                        total = total.chain(acc -> session.createNativeQuery(sql)
                                .setParameter(1, criterioId)
                                .setParameter(2, unidadeId)
                                .setParameter(3, curriculoId)
                                .executeUpdate()
                                .map(updateCount -> acc + updateCount));
                    }
                    return total;
                });
    }

    // FilterOferecimentoTrocaTurma: unidade in (?2) and dataFim > ?3 and componenteCurricular = ?4
    // and id <> ?5 and (status = 'LIBERADA' or status = 'EM_ANDAMENTO')
    public static final String SQL_OFERECIMENTOS_DISPONIVEIS_TROCA_TURMA =
            "SELECT o.id AS id, o.id_unidade AS unidade_id, o.id_grupo AS grupo_id, o.status AS status, " +
                    " o.data_inicio AS data_inicio, o.data_fim AS data_fim, o.vagas AS vagas, o.inscritos AS inscritos " +
                    "FROM edc_oferecimento_componente_curricular o " +
                    "WHERE o.id_componente_curricular = ?4 AND o.id <> ?5 " +
                    "AND o.data_fim > ?3 " +
                    "AND (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') " +
                    "AND o.id_unidade IN (?2) ORDER BY o.id";

    public Uni<List<Tuple>> oferecimentosDisponiveisTrocaTurma(List<Long> unidadesIds, Date inicio,
                                                            Long componenteCurricularId, Long oferecimentoComponenteCurricularId) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_OFERECIMENTOS_DISPONIVEIS_TROCA_TURMA, Tuple.class)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, inicio)
                        .setParameter(4, componenteCurricularId)
                        .setParameter(5, oferecimentoComponenteCurricularId)
                        .getResultList());
    }

    // FilterOferecimentoTrocaComponente: unidade in (?2) and dataFim > ?4 and componenteCurricular <> ?3
    // and curriculo = ?5 and (status = 'LIBERADA' or status = 'EM_ANDAMENTO')
    public static final String SQL_OFERECIMENTOS_DISPONIVEIS_TROCA_COMPONENTE =
            "SELECT o.id AS id, o.id_unidade AS unidade_id, o.id_grupo AS grupo_id, o.status AS status, " +
                    " o.data_inicio AS data_inicio, o.data_fim AS data_fim, o.vagas AS vagas, o.inscritos AS inscritos " +
                    "FROM edc_oferecimento_componente_curricular o " +
                    "WHERE o.id_componente_curricular <> ?3 AND o.id_curso = ?5 " +
                    "AND o.data_fim > ?4 " +
                    "AND (o.status = 'LIBERADA' OR o.status = 'EM_ANDAMENTO') " +
                    "AND o.id_unidade IN (?2) ORDER BY o.id";

    public Uni<List<Tuple>> oferecimentosDisponiveisTrocaComponente(List<Long> unidadesIds, Long componenteCurricularId,
                                                                  Date inicio, Long curriculoId) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_OFERECIMENTOS_DISPONIVEIS_TROCA_COMPONENTE, Tuple.class)
                        .setParameter(2, unidadesIds)
                        .setParameter(3, componenteCurricularId)
                        .setParameter(4, inicio)
                        .setParameter(5, curriculoId)
                        .getResultList());
    }
}