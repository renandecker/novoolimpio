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

    private Uni<Integer> nativeUpdate(String sql, Object... params) {
        return Panache.getSession().onItem().transformToUni(session -> {
            var query = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) query.setParameter(i + 1, params[i]);
            return query.executeUpdate();
        });
    }

    public Uni<Long> pessoaIdPorUsername(String username) {
        String sql = """
        SELECT u.id_pessoa
        FROM bas_login l
        JOIN bas_usuario u ON u.id = l.id_usuario
        WHERE lower (l.username) = lower(?1)
        LIMIT 1
        """;
        return nativeList(sql, username)
                .map(rows -> rows.isEmpty() ? null : asLong(rows.get(0)));
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
        COALESCE(u.foto_base64, '') AS foto,
        COALESCE(f.nome_pai, '') AS nome_pai,
        COALESCE(f.nome_mae, '') AS nome_mae,
        COALESCE(f.nome_referencia, '') AS nome_referencia,
        COALESCE(f.telefone_referencia, '') AS telefone_referencia,
        COALESCE(f.facebook, '') AS facebook,
        COALESCE(f.twitter, '') AS twitter,
        COALESCE(f.telefone_comercial, '') AS telefone_comercial,
        COALESCE(gen.descricao, '') AS genero,
        COALESCE(et.descricao, '') AS etnia,
        COALESCE(es.descricao, '') AS escolaridade,
        COALESCE(ec.descricao, '') AS estado_civil
        FROM bas_login l
        JOIN bas_usuario u ON u.id = l.id_usuario
        JOIN bas_pessoa p ON p.id = u.id_pessoa
        LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = p.id
        LEFT JOIN bas_genero gen ON gen.id = f.id_genero
        LEFT JOIN bas_etnia et ON et.id = f.id_etnia
        LEFT JOIN bas_escolaridade es ON es.id = f.id_escolaridade
        LEFT JOIN bas_estado_civil ec ON ec.id = f.id_estado_civil
        WHERE lower (l.username) = lower(?1)
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
        SELECT COALESCE (g.id, 0)AS grau_id,
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
        SELECT COALESCE ((SELECT current_date - p.data_vencimento
        FROM fin_parcela p
        WHERE p.data_pagamento IS NULL AND p.data_cancelamento IS NULL
        AND p.data_vencimento<current_date AND p.id_pessoa = ?1
        ORDER BY p.data_vencimento
        LIMIT 1),0)AS dias_atraso,
        COALESCE((SELECT SUM(c.qtde_parcelas_atrasadas) FROM edc_contrato c WHERE c.id_pessoa = ?1),0) AS qtd_atrasadas,
        COALESCE((SELECT SUM(c.qtde_parcelas_nao_pagas) FROM edc_contrato c WHERE c.id_pessoa = ?1),0) AS qtd_restantes,
        COALESCE((SELECT SUM(c.valor_parcelas) FROM edc_contrato c WHERE c.id_pessoa = ?1),0) AS valor_pendente
        """;
        return nativeList(sql, pessoaId)
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
        String sql = "SELECT p.id," +
            "p.id_contrato," +
            "p.parcela," +
            "p.parcela_sequencia," +
            "COALESCE(p.multa, 0), " +
            "COALESCE(p.juros, 0), " +
            "COALESCE(p.desconto, 0), " +
            "p.data_vencimento, " +
            "p.data_pagamento, " +
            "p.data_cancelamento, " +
            "p.valor, " +
            "p.valor_pago, " +
            "COALESCE(p.forma_pagamento, ''), " +
            "p.fl_reparcela, " +
            "p.fl_cancelamento, " +
            "p.fl_original, " +
            "(p.id_venda IS NOT NULL)AS venda_produto, " +
            "(p.id_multa_livro IS NOT NULL)AS multa_livro, " +
            "p.id_parcela_pix " +
            "FROM fin_parcela p " +
            "WHERE p.id_pessoa = ?1 AND " + condicao + " " +
            "ORDER BY p.data_vencimento ASC NULLS LAST, p.id ASC";
        return nativeList(sql, params);
    }

    public Uni<Object[]> pessoaDadosPorPessoa(Long pessoaId) {
        String sql = """
        SELECT p.id,
                COALESCE(f.nome, '') AS nome,
        COALESCE(f.cpf, '') AS cpf,
        COALESCE(f.rg, '') AS rg,
        f.data_nascimento,
                COALESCE(p.email, '') AS email,
        COALESCE(p.telefone, '') AS telefone,
        COALESCE(p.celular, '') AS celular
        FROM bas_pessoa p
        LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = p.id
        WHERE p.id = ?1
        LIMIT 1
        """;
        return nativeList(sql, pessoaId)
                .map(rows -> rows.isEmpty() ? null : (Object[]) rows.get(0));
    }

    public Uni<List<Object[]>> responsaveisPorPessoa(Long pessoaId) {
        String sql = """
        SELECT DISTINCT p.id,
                COALESCE(f.nome, '') AS nome,
        COALESCE(f.cpf, '') AS cpf,
        COALESCE(f.rg, '') AS rg,
        f.data_nascimento,
                COALESCE(p.email, '') AS email,
        COALESCE(p.telefone, '') AS telefone,
        COALESCE(p.celular, '') AS celular
        FROM edc_contrato ct
        JOIN bas_pessoa p ON p.id = ct.id_responsavel
        LEFT JOIN bas_pessoa_fisica f ON f.id_pessoa = p.id
        WHERE ct.id_pessoa = ?1
        ORDER BY COALESCE(f.nome, '') ASC
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> historicoNapLigacaoPorPessoa(Long pessoaId) {
        String sql = """
        SELECT ln.id,
                ln.data_inicial,
                COALESCE(ln.telefone, '') AS telefone,
        COALESCE(ln.observacao, '') AS observacao,
        COALESCE(r.descricao, '') AS resultado,
        ln.retorno_aula
        FROM edc_ligacao_nap ln
        LEFT JOIN edc_resultado_ligacao_nap r ON r.id = ln.id_resultado_ligacao_nap
        WHERE ln.id_contrato IN (SELECT id FROM edc_contrato WHERE id_pessoa = ?1)
        ORDER BY ln.data_inicial DESC NULLS LAST, ln.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> historicoNapEmailPorPessoa(Long pessoaId) {
        String sql = """
        SELECT en.id,
                en.data,
                COALESCE(en.email, '') AS email,
        COALESCE(en.assunto, '') AS assunto,
        COALESCE(en.mensagem, '') AS mensagem
        FROM edc_email_nap en
        WHERE en.id_contrato IN (SELECT id FROM edc_contrato WHERE id_pessoa = ?1)
        ORDER BY en.data DESC NULLS LAST, en.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> historicoCobrancaLigacaoPorPessoa(Long pessoaId) {
        String sql = """
        SELECT lc.id,
                lc.data_inicial,
                COALESCE(lc.telefone, '') AS telefone,
        COALESCE(lc.observacao, '') AS observacao,
        COALESCE(r.descricao, '') AS resultado,
        lc.qtde_parcela,
                lc.valor
        FROM fin_ligacao_cobranca lc
        LEFT JOIN fin_resultado_ligacao_cobranca r ON r.id = lc.id_resultado_cobranca
        WHERE lc.id_contrato IN (SELECT id FROM edc_contrato WHERE id_pessoa = ?1)
        ORDER BY lc.data_inicial DESC NULLS LAST, lc.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> historicoCobrancaEmailPorPessoa(Long pessoaId) {
        String sql = """
        SELECT ec.id,
                ec.data,
                COALESCE(ec.email, '') AS email,
        COALESCE(ec.assunto, '') AS assunto,
        COALESCE(ec.mensagem, '') AS mensagem,
        ec.qtde_parcela,
                ec.valor
        FROM fin_email_cobranca ec
        WHERE ec.id_contrato IN (SELECT id FROM edc_contrato WHERE id_pessoa = ?1)
        ORDER BY ec.data DESC NULLS LAST, ec.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<List<Object[]>> historicoAlunoPorPessoa(Long pessoaId) {
        String sql = """
        SELECT ha.id,
                ha.data_registro,
                COALESCE(ha.descricao, '') AS descricao,
        COALESCE(ha.id_usuario, 0) AS id_usuario,
        COALESCE(l.username, '') AS usuario_nome
        FROM edc_historico_aluno ha
        LEFT JOIN bas_usuario u ON u.id = ha.id_usuario
        LEFT JOIN bas_login l ON l.id_usuario = u.id
        WHERE ha.id_aluno = ?1
        ORDER BY ha.data_registro DESC NULLS LAST, ha.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    // Registro de aulas (edc_aula/edc_aula_aluno - legado V1_4_584__aulas.sql):
    // aulas das turmas (oferecimentos) em que o aluno possui matricula ativa.

    public Uni<List<Object[]>> chamadasPorPessoa(Long pessoaId) {
        String sql = """
        SELECT a.id,
                COALESCE(a.nome, '') AS nome,
        COALESCE(a.descricao, '') AS descricao,
        COALESCE(cc.descricao, '') AS componente,
        COALESCE(of.sequencia, 0) AS turma,
        occ.data AS data_aula,
        aa.data_assitida
        FROM edc_aula a
        JOIN edc_ocorrencia_componente_curricular occ ON occ.id = a.id_ocorrencia_componente_curricular
        JOIN edc_oferecimento_componente_curricular of ON of.id = occ.id_oferecimento_componente_curricular
        LEFT JOIN edc_componente_curricular cc ON cc.id = of.id_componente_curricular
        LEFT JOIN edc_aula_aluno aa ON aa.id_aula = a.id AND aa.id_pessoa = ?1
        WHERE of.id IN (
        SELECT m.id_oferecimento_componente_curricular
        FROM edc_matricula m
        JOIN edc_contrato ct ON ct.id = m.id_contrato
        WHERE ct.id_pessoa = ?1
        AND m.data_cancelamento IS NULL
        AND m.id_oferecimento_componente_curricular IS NOT NULL
        )
        ORDER BY occ.data DESC NULLS LAST, a.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    // Avaliacoes (edc_avaliacao/edc_avaliacao_pergunta/edc_avaliacao_resposta/
    // edc_avaliacao_aluno): questionarios vinculados as matriculas do aluno.

    public Uni<List<Object[]>> avaliacoesPorPessoa(Long pessoaId) {
        String sql = """
        SELECT av.id,
                COALESCE(av.nome, '') AS nome,
        COALESCE(av.descricao, '') AS descricao,
        COALESCE(cc.descricao, '') AS componente,
        COALESCE(of.sequencia, 0) AS turma,
        av.data_inicial,
        av.data_final,
        COALESCE(av.fl_ativo, false) AS ativa,
        EXISTS (SELECT 1 FROM edc_avaliacao_aluno aa
        WHERE aa.id_avaliacao = av.id AND aa.id_pessoa = ?1
        AND (aa.salvo <> 0 OR aa.resposta IS NOT NULL OR aa.id_avaliacao_resposta IS NOT NULL)) AS respondida
        FROM edc_avaliacao av
        LEFT JOIN edc_nota_componente_curricular_matricula ncm ON ncm.id = av.id_nota_componente_curricular_matricula
        LEFT JOIN edc_matricula m ON m.id = ncm.id_matricula
        LEFT JOIN edc_oferecimento_componente_curricular of ON of.id = m.id_oferecimento_componente_curricular
        LEFT JOIN edc_componente_curricular cc ON cc.id = of.id_componente_curricular
        WHERE m.id IN (
        SELECT m2.id
        FROM edc_matricula m2
        JOIN edc_contrato ct ON ct.id = m2.id_contrato
        WHERE ct.id_pessoa = ?1 AND m2.data_cancelamento IS NULL
        )
        ORDER BY av.data_final DESC NULLS LAST, av.id DESC
        """;
        return nativeList(sql, pessoaId);
    }

    public Uni<Boolean> avaliacaoPertenceAoAluno(Long avaliacaoId, Long pessoaId) {
        String sql = """
        SELECT 1
        FROM edc_avaliacao av
        JOIN edc_nota_componente_curricular_matricula ncm ON ncm.id = av.id_nota_componente_curricular_matricula
        JOIN edc_matricula m ON m.id = ncm.id_matricula
        JOIN edc_contrato ct ON ct.id = m.id_contrato
        WHERE av.id = ?1 AND ct.id_pessoa = ?2
        LIMIT 1
        """;
        return nativeList(sql, avaliacaoId, pessoaId).map(rows -> !rows.isEmpty());
    }

    public Uni<Object[]> avaliacaoPorId(Long avaliacaoId) {
        String sql = """
        SELECT av.id,
                COALESCE(av.nome, '') AS nome,
        COALESCE(av.descricao, '') AS descricao,
        COALESCE(av.fl_ativo, false) AS ativa
        FROM edc_avaliacao av
        WHERE av.id = ?1
        LIMIT 1
        """;
        return nativeList(sql, avaliacaoId).map(rows -> rows.isEmpty() ? null : (Object[]) rows.get(0));
    }

    public Uni<List<Object[]>> perguntasDaAvaliacao(Long avaliacaoId, Long pessoaId) {
        String sql = """
        SELECT p.id AS pergunta_id,
                COALESCE(p.pergunta, '') AS pergunta,
        COALESCE(p.tipo, '') AS tipo,
        r.id AS resposta_id,
        COALESCE(r.resposta, '') AS resposta_opcao,
        aa.id_avaliacao_resposta AS escolhida_id,
        aa.resposta AS resposta_aluno
        FROM edc_avaliacao_pergunta p
        LEFT JOIN edc_avaliacao_resposta r ON r.id_avaliacao_pergunta = p.id
        LEFT JOIN edc_avaliacao_aluno aa ON aa.id_avaliacao_pergunta = p.id
        AND aa.id_avaliacao = ?1 AND aa.id_pessoa = ?2
        WHERE p.id_avaliacao = ?1
        ORDER BY p.id, r.id
        """;
        return nativeList(sql, avaliacaoId, pessoaId);
    }

    public Uni<Void> removerRespostas(Long avaliacaoId, Long pessoaId) {
        String sql = "DELETE FROM edc_avaliacao_aluno WHERE id_avaliacao = ?1 AND id_pessoa = ?2";
        return nativeUpdate(sql, avaliacaoId, pessoaId).replaceWithVoid();
    }

    public Uni<Void> inserirResposta(Long pessoaId, Long avaliacaoId, Long perguntaId,
                                     Long respostaId, String respostaTexto) {
        String sql = """
        INSERT INTO edc_avaliacao_aluno (id_pessoa, id_avaliacao, id_avaliacao_pergunta,
        id_avaliacao_resposta, resposta, salvo)
        VALUES (?1, ?2, ?3, NULLIF(?4, 0), NULLIF(?5, ''), 1)
        """;
        return nativeUpdate(sql, pessoaId, avaliacaoId, perguntaId,
                respostaId == null ? 0L : respostaId, respostaTexto == null ? "" : respostaTexto).replaceWithVoid();
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n)return n.longValue();
        return Long.valueOf(o.toString());
    }
}
