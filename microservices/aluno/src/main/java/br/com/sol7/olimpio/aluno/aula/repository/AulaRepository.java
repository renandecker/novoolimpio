package br.com.sol7.olimpio.aluno.aula.repository;

import br.com.sol7.olimpio.aluno.aula.entity.Aula;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Date;
import java.util.List;

@ApplicationScoped
public class AulaRepository implements PanacheRepository<Aula> {

    @SuppressWarnings("unchecked")
    private <T> Uni<List<T>> nativeList(String sql, Object... params) {
        return Panache.getSession().onItem().transformToUni(session -> {
            var query = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
            return query.getResultList();
        }).map(list -> (List<T>) list);
    }

    @SuppressWarnings("unchecked")
    private <T> Uni<T> nativeOne(String sql, Object... params) {
        return Panache.getSession().onItem().transformToUni(session -> {
            var query = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
            return query.getResultList();
        }).map(list -> list.isEmpty() ? null : (T) list.get(0));
    }

    public Uni<Long> pessoaIdPorUsername(String username) {
        String sql = """
        SELECT u.id_pessoa
        FROM bas_login l
        JOIN bas_usuario u ON u.id = l.id_usuario
        WHERE lower (l.username) = lower( ? 1)
        LIMIT 1
        """;
        return nativeList(sql, username)
                .map(rows -> rows.isEmpty() ? null : asLong(firstColumn(rows.get(0))));
    }

    public Uni<List<Object[]>> contratosDoAluno(Long pessoaId) {
        String sql = """
        SELECT DISTINCT c.id, COALESCE(cur.nome, '') AS curso
        FROM edc_contrato c
        JOIN edc_curriculo cr ON cr.id = c.id_curso
        JOIN edc_curso cur ON cur.id = cr.id_curso
        WHERE c.id_pessoa = ?1 AND c.ativo = true AND c.data_cancelamento IS NULL
        AND c.desistente IS NOT true
        ORDER BY curso
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> oferecimentosDoContrato(Long contratoId) {
        String sql = """
        SELECT DISTINCT of.id, COALESCE(cc.sucinto, cc.descricao, '') AS modulo
        FROM edc_matricula m
        JOIN edc_oferecimento_componente_curricular of ON of.id = m.id_oferecimento_componente_curricular
        JOIN edc_componente_curricular cc ON cc.id = of.id_componente_curricular
        WHERE m.id_contrato = ?1 AND m.data_cancelamento IS NULL
        ORDER BY modulo
        """;
        return nativeList(sql, contratoId);
    }

    public Uni<List<Object[]>> ocorrenciasDoOferecimento(Long oferecimentoId) {
        String sql = """
        SELECT occ.id, occ.data, COALESCE(occ.aula_coringa, false) AS aula_coringa,
        COALESCE(occ.aula_presencial, false) AS aula_presencial
        FROM edc_ocorrencia_componente_curricular occ
        WHERE occ.id_oferecimento_componente_curricular = ?1 AND occ.fl_ativo = true
        ORDER BY occ.data
        """;
        return nativeList(sql, oferecimentoId);
    }

    public Uni<List<Aula>> aulasDaOcorrencia(Long ocorrenciaId) {
        return list("ocorrenciaComponenteCurricularId", ocorrenciaId);
    }

    public Uni<List<Aula>> aulasDoOferecimento(Long oferecimentoId) {
        String sql = """
        SELECT a.*
        FROM edc_aula a
        JOIN edc_ocorrencia_componente_curricular occ ON occ.id = a.id_ocorrencia_componente_curricular
        WHERE occ.id_oferecimento_componente_curricular = ?1
        ORDER BY occ.data, a.id
        """;
        return Panache.getSession().onItem().transformToUni(session ->
                session.createNativeQuery(sql, Aula.class).setParameter(1, oferecimentoId).getResultList());
    }

    public Uni<Date> marcarAssistida(Long aulaId, Long pessoaId) {
        String sql = """
        INSERT INTO edc_aula_aluno(id_aula, id_pessoa, data_assitida)
        VALUES( ? 1, ?2, now())
        ON CONFLICT (id_aula, id_pessoa)DO UPDATE SET data_assitida = now()
        RETURNING data_assitida
        """;
        return nativeOne(sql, aulaId, pessoaId).map(row -> {
            if (row == null) return new Date();
            Object o = firstColumn(row);
            if (o instanceof java.sql.Timestamp ts)return new Date(ts.getTime());
            if (o instanceof Date d)return d;
            return new Date();
        });
    }

    public Uni<Boolean> jaAssistida(Long aulaId, Long pessoaId) {
        String sql = "SELECT count(*) FROM edc_aula_aluno WHERE id_aula = ?1 AND id_pessoa = ?2";
        return nativeList(sql, aulaId, pessoaId)
                .map(rows -> !rows.isEmpty() && asLong(firstColumn(rows.get(0))) > 0);
    }

    private Object firstColumn(Object row) {
        if (row instanceof Object[] arr)return arr[0];
        return row;
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n)return n.longValue();
        return Long.valueOf(o.toString());
    }
}
