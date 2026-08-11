package br.com.sol7.olimpio.aluno.repository;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class AlunoRepository {

    @SuppressWarnings("unchecked")
    private <T> Uni<List<T>> nativeList(String sql, Object... params) {
        return Panache.getSession().onItem().transformToUni(session -> {
            var query = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
            return query.getResultList();
        }).map(list -> (List<T>) list);
    }

    public Uni<Long> pessoaIdPorUsername(String username) {
        String sql = """
            SELECT u.id_pessoa
            FROM bas_login l
            JOIN bas_usuario u ON u.id = l.id_usuario
            WHERE lower(l.username) = lower(?1)
            LIMIT 1
            """;
        return nativeList(sql, username)
                .map(rows -> rows.isEmpty() ? null : asLong(((Object[]) rows.get(0))[0]));
    }

    public Uni<Object[]> perfilPorUsername(String username) {
        String sql = """
            SELECT l.username,
                   COALESCE(f.nome, '') AS nome,
                   COALESCE(f.nome_social, '') AS nome_social,
                   COALESCE(f.cpf, '') AS cpf,
                   COALESCE(f.rg, '') AS rg,
                   f.data_nascimento,
                   COALESCE(p.email, '') AS email,
                   COALESCE(p.telefone, '') AS telefone,
                   COALESCE(p.celular, '') AS celular,
                   COALESCE(u.foto_base64, '') AS foto
            FROM bas_login l
            JOIN bas_usuario u ON u.id = l.id_usuario
            JOIN bas_pessoa p ON p.id = u.id_pessoa
            LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = p.id
            WHERE lower(l.username) = lower(?1)
            LIMIT 1
            """;
        return nativeList(sql, username)
                .map(rows -> rows.isEmpty() ? null : (Object[]) rows.get(0));
    }

    public Uni<List<Object[]>> matriculasPorPessoa(Long pessoaId) {
        String sql = """
            SELECT m.id,
                   COALESCE(c.nome, '') AS curso,
                   COALESCE(cc.descricao, '') AS componente,
                   COALESCE(un.nome_fantasia, '') AS unidade,
                   COALESCE(of.sequencia, 0) AS turma,
                   COALESCE(per.descricao, '') AS periodo,
                   per.ano,
                   m.status,
                   m.data,
                   m.media_final,
                   m.percentual_presenca,
                   m.qtde_aula,
                   m.qtde_aula_feita,
                   m.qtde_aula_presente,
                   m.qtde_aula_meia_presente,
                   m.qtde_falta,
                   m.qtde_aula_atrasado,
                   COALESCE(f.nome, '') AS professor
            FROM edc_matricula m
            JOIN edc_contrato ct ON ct.id = m.id_contrato
            JOIN edc_curso c ON c.id = ct.id_curso
            LEFT JOIN edc_oferecimento_componente_curricular of ON of.id = m.id_oferecimento_componente_curricular
            LEFT JOIN edc_componente_curricular cc ON cc.id = of.id_componente_curricular
            LEFT JOIN edc_periodo per ON per.id = of.id_periodo
            LEFT JOIN bas_unidade un ON un.id = ct.id_unidade
            LEFT JOIN bas_pessoa pprof ON pprof.id = of.id_professor
            LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = pprof.id
            WHERE ct.id_pessoa = ?1 AND m.data_cancelamento IS NULL
            ORDER BY per.ano DESC NULLS LAST, m.data DESC NULLS LAST
            """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> notasGrauPorMatricula(Long matriculaId) {
        String sql = """
            SELECT COALESCE(g.id, 0) AS grau_id,
                   COALESCE(g.descricao, '') AS grau_descricao,
                   ncm.id AS ncm_id,
                   COALESCE(gn.id, 0) AS id_grau_nota,
                   COALESCE(gn.nome, '') AS grau_nota_nome,
                   gn.numero_nota,
                   gn.peso,
                   ncm.nota AS nota_grau,
                   COALESCE(g.nota_maxima, 0) AS nota_maxima,
                   COALESCE(g.media_final, 0) AS media_final,
                   COALESCE(g.media_sem_exame, 0) AS media_sem_exame,
                   COALESCE(g.frequencia_minima, 0) AS frequencia_minima
            FROM edc_nota_componente_curricular_matricula ncm
            LEFT JOIN edc_grau_nota gn ON gn.id = ncm.id_grau_nota
            LEFT JOIN edc_grau g ON g.id = gn.id_grau
            WHERE ncm.id_matricula = ?1
            ORDER BY COALESCE(g.id, 0), COALESCE(gn.numero_nota, 0), ncm.id
            """;
        return nativeList(sql, matriculaId);
    }

    public Uni<List<Object[]>> avaliacoesPorMatricula(Long matriculaId) {
        String sql = """
            SELECT ncm.id AS ncm_id,
                   n.ordem,
                   n.nota,
                   COALESCE(gc.conceito, '') AS conceito
            FROM edc_nota n
            JOIN edc_nota_componente_curricular_matricula ncm ON ncm.id = n.id_nota_componente_curricular_matricula
            LEFT JOIN edc_grau_conceito gc ON gc.id = n.id_conceito_notas
            WHERE ncm.id_matricula = ?1
            ORDER BY ncm.id, COALESCE(n.ordem, 0), n.id
            """;
        return nativeList(sql, matriculaId);
    }

    public Uni<List<Object[]>> presencasPorMatricula(Long matriculaId) {
        String sql = """
            SELECT occ.id AS ocorrencia_id,
                   occ.data,
                   COALESCE(cad.presenca, '') AS presenca,
                   COALESCE(cc.descricao, '') AS componente
            FROM edc_caderno_componente_curricular cad
            JOIN edc_ocorrencia_componente_curricular occ ON occ.id = cad.id_ocorrencia_componente_curricular
            LEFT JOIN edc_oferecimento_componente_curricular of ON of.id = occ.id_oferecimento_componente_curricular
            LEFT JOIN edc_componente_curricular cc ON cc.id = of.id_componente_curricular
            WHERE cad.id_matricula = ?1
            ORDER BY occ.data NULLS LAST, occ.id
            """;
        return nativeList(sql, matriculaId);
    }

    public Uni<Object[]> resumoFinanceiroPorPessoa(Long pessoaId) {
        String sql = """
            SELECT COALESCE((SELECT current_date - p.data_vencimento
                            FROM fin_parcela p
                            WHERE p.data_pagamento IS NULL AND p.data_cancelamento IS NULL
                              AND p.data_vencimento < current_date AND p.id_pessoa = ?1
                            ORDER BY p.data_vencimento
                            LIMIT 1), 0) AS dias_atraso,
                   COALESCE((SELECT SUM(c.qtde_parcelas_atrasadas) FROM edc_contrato c WHERE c.id_pessoa = ?1), 0) AS qtd_atrasadas,
                   COALESCE((SELECT SUM(c.qtde_parcelas_nao_pagas) FROM edc_contrato c WHERE c.id_pessoa = ?1), 0) AS qtd_restantes,
                   COALESCE((SELECT SUM(c.valor_parcelas) FROM edc_contrato c WHERE c.id_pessoa = ?1), 0) AS valor_pendente
            """;
        return nativeList(sql, pessoaId, pessoaId, pessoaId, pessoaId)
                .map(rows -> rows.isEmpty() ? null : (Object[]) rows.get(0));
    }

    public Uni<List<Object[]>> contratosPorPessoa(Long pessoaId) {
        String sql = """
            SELECT ct.id,
                   COALESCE(c.nome, '') AS curso,
                   COALESCE(un.sucinto, '') AS unidade,
                   COALESCE(unr.sucinto, '') AS unidade_responsavel,
                   ct.data_cancelamento,
                   ct.desistente,
                   ct.inscricao,
                   COALESCE(ct.qtde_reparcelamento, 0) AS qtde_reparcelamento,
                   pr.parcela_sequencia AS prox_parcela_seq,
                   pr.data_vencimento AS prox_parcela_data,
                   pr.valor AS prox_parcela_valor,
                   ul.parcela_sequencia AS ult_parcela_seq,
                   ul.data_vencimento AS ult_parcela_data,
                   ul.valor AS ult_parcela_valor
            FROM edc_contrato ct
            LEFT JOIN edc_curriculo cur ON cur.id = ct.id_curso
            LEFT JOIN edc_curso c ON c.id = cur.id_curso
            LEFT JOIN bas_unidade un ON un.id = ct.id_unidade
            LEFT JOIN bas_unidade unr ON unr.id = ct.id_unidade_resposavel
            LEFT JOIN fin_parcela pr ON pr.id = ct.id_proxima_parcela
            LEFT JOIN fin_parcela ul ON ul.id = ct.id_ultima_parcela
            WHERE ct.id_pessoa = ?1
            ORDER BY ct.id
            """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> parcelasMesPorPessoa(Long pessoaId, LocalDate inicioMes, LocalDate fimMes, LocalDate hoje) {
        return parcelasPorPessoa(
                "p.data_cancelamento IS NULL AND (p.data_vencimento BETWEEN ?2 AND ?3 OR (p.data_pagamento IS NULL AND p.data_vencimento <= ?4))",
                pessoaId, inicioMes, fimMes, hoje);
    }

    public Uni<List<Object[]>> parcelasMatriculaPorPessoa(Long pessoaId) {
        return parcelasPorPessoa("p.data_cancelamento IS NULL AND p.id_contrato IS NOT NULL", pessoaId);
    }

    public Uni<List<Object[]>> parcelasProdutosPorPessoa(Long pessoaId) {
        return parcelasPorPessoa("p.data_cancelamento IS NOT NULL AND p.id_venda IS NOT NULL", pessoaId);
    }

    public Uni<List<Object[]>> parcelasCanceladasPorPessoa(Long pessoaId) {
        return parcelasPorPessoa("p.data_cancelamento IS NOT NULL", pessoaId);
    }

    private Uni<List<Object[]>> parcelasPorPessoa(String condicao, Object... params) {
        String sql = """
            SELECT p.id,
                   p.id_contrato,
                   p.parcela,
                   p.parcela_sequencia,
                   COALESCE(p.multa, 0),
                   COALESCE(p.juros, 0),
                   COALESCE(p.desconto, 0),
                   p.data_vencimento,
                   p.data_pagamento,
                   p.data_cancelamento,
                   p.valor,
                   p.valor_pago,
                   COALESCE(p.forma_pagamento, ''),
                   p.fl_reparcela,
                   p.fl_cancelamento,
                   p.fl_original,
                   (p.id_venda IS NOT NULL) AS venda_produto,
                   (p.id_multa_livro IS NOT NULL) AS multa_livro
            FROM fin_parcela p
            WHERE p.id_pessoa = ?1 AND """ + condicao + """
            ORDER BY p.data_vencimento ASC NULLS LAST, p.id ASC
            """;
        return nativeList(sql, params);
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        return Long.valueOf(o.toString());
    }
}
