package br.com.sol7.olimpio.professor.gestao.service;

import br.com.sol7.olimpio.professor.gestao.dto.*;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

@ApplicationScoped
@WithTransaction
public class GestaoProfessorService {

    private static final SimpleDateFormat DIA = new SimpleDateFormat("dd/MM/yyyy");

    private static final String SQL_TURMA =
            "SELECT off.id AS id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, '') AS professor_nome, " +
                    " COALESCE(grp.nome, '') AS grupo_nome, " +
                    " COALESCE(c.nome, '') AS curso_nome, " +
                    " COALESCE(cc.descricao, '') AS componente_descricao, " +
                    " COALESCE(off.status, '') AS status " +
                    " FROM edc_oferecimento_componente_curricular off " +
                    " INNER JOIN edc_professor p ON p.id = off.id_professor " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " LEFT JOIN edc_grupo grp ON grp.id = off.id_grupo " +
                    " INNER JOIN edc_curriculo cur ON cur.id = off.id_curso " +
                    " INNER JOIN edc_curso c ON c.id = cur.id_curso " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = off.id_componente_curricular ";

    private static final String SQL_TURMAS = SQL_TURMA + " WHERE off.id_professor = ?1 ORDER BY off.id DESC";

    private static final String SQL_OCORRENCIAS =
            "SELECT DISTINCT o.id AS id, o.data AS data, o.fl_ativo AS ativo " +
                    " FROM edc_caderno_componente_curricular c " +
                    " INNER JOIN edc_ocorrencia_componente_curricular o ON o.id = c.id_ocorrencia_componente_curricular " +
                    " WHERE o.id_oferecimento_componente_curricular = ?1 " +
                    " AND o.fl_ativo = true " +
                    " AND c.presenca IN ('n','a','m','p','t') " +
                    " ORDER BY o.data, o.id";

    private static final String SQL_ALUNOS =
            "SELECT m.id AS matricula_id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, '') AS aluno_nome, " +
                    " (m.status = 'CURSANDO' AND con.ativo = true) AS aluno_ativo, " +
                    " ccc.id AS caderno_id, o.id AS ocorrencia_id, o.data AS ocorrencia_data, ccc.presenca AS presenca " +
                    " FROM edc_matricula m " +
                    " INNER JOIN edc_contrato con ON con.id = m.id_contrato " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = con.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " INNER JOIN edc_caderno_componente_curricular ccc ON ccc.id_matricula = m.id " +
                    " INNER JOIN edc_ocorrencia_componente_curricular o ON o.id = ccc.id_ocorrencia_componente_curricular " +
                    " WHERE m.id_oferecimento_componente_curricular = ?1 " +
                    " AND o.fl_ativo = true " +
                    " AND ccc.presenca IN ('n','a','m','p','t') " +
                    " ORDER BY lower(COALESCE(pf.nome, pj.nome_fantasia, '')), o.data, o.id";

    private static final String SQL_INFO_TURMA =
            "SELECT off.id AS id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, '') AS professor_nome, " +
                    " COALESCE(pes.telefone, '') AS telefone, " +
                    " COALESCE(pes.celular, '') AS celular, " +
                    " COALESCE(pes.email, '') AS email, " +
                    " COALESCE(un.sucinto, '') AS unidade_sucinto, " +
                    " COALESCE(grp.nome, '') AS grupo_nome, " +
                    " COALESCE(c.nome, '') AS curso_nome, " +
                    " COALESCE(cc.descricao, '') AS componente_descricao, " +
                    " COALESCE(off.status, '') AS status " +
                    " FROM edc_oferecimento_componente_curricular off " +
                    " INNER JOIN edc_professor p ON p.id = off.id_professor " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " LEFT JOIN bas_unidade un ON un.id = off.id_unidade " +
                    " LEFT JOIN edc_grupo grp ON grp.id = off.id_grupo " +
                    " INNER JOIN edc_curriculo cur ON cur.id = off.id_curso " +
                    " INNER JOIN edc_curso c ON c.id = cur.id_curso " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = off.id_componente_curricular " +
                    " WHERE off.id = ?1";

    private static final String SQL_INFO_DIAS_AULA =
            "SELECT DISTINCT o.data AS data, COALESCE(ds.nome, '') AS dia_semana, t.inicio AS inicio, t.fim AS fim, COALESCE(s.numero, 0) AS sala_numero " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " LEFT JOIN edc_dia_aula da ON da.id = o.id_dia_aula " +
                    " LEFT JOIN bas_dia_semana ds ON ds.id = da.id_dia_semana " +
                    " LEFT JOIN edc_turno t ON t.id = da.id_turno " +
                    " LEFT JOIN edc_sala s ON s.id = o.id_sala " +
                    " WHERE o.id_oferecimento_componente_curricular = ?1 " +
                    " ORDER BY o.data";

    private static final String SQL_INFO_ALUNOS =
            "SELECT m.id AS matricula_id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, '') AS aluno_nome, " +
                    " COALESCE(pf.cpf, '') AS aluno_cpf, " +
                    " COALESCE(pes.telefone, '') AS telefone, " +
                    " COALESCE(pes.celular, '') AS celular, " +
                    " COALESCE(rf.nome, rpj.nome_fantasia, '') AS responsavel_nome, " +
                    " COALESCE(rf.cpf, '') AS responsavel_cpf, " +
                    " COALESCE(rpes.telefone, '') AS responsavel_telefone, " +
                    " COALESCE(rpes.celular, '') AS responsavel_celular " +
                    " FROM edc_matricula m " +
                    " INNER JOIN edc_contrato con ON con.id = m.id_contrato " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = con.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa rpes ON rpes.id = con.id_responsavel " +
                    " LEFT JOIN bas_pessoa_fisica rf ON rf.id_pessoa = rpes.id " +
                    " LEFT JOIN bas_pessoa_juridica rpj ON rpj.id_pessoa = rpes.id " +
                    " WHERE m.id_oferecimento_componente_curricular = ?1 " +
                    " AND m.data_cancelamento IS NULL " +
                    " ORDER BY lower(COALESCE(pf.nome, pj.nome_fantasia, ''))";

    private static final String SQL_TURMA_COM_GRAU =
            "SELECT off.id AS id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, '') AS professor_nome, " +
                    " COALESCE(grp.nome, '') AS grupo_nome, " +
                    " COALESCE(c.nome, '') AS curso_nome, " +
                    " COALESCE(cc.descricao, '') AS componente_descricao, " +
                    " COALESCE(off.status, '') AS status, " +
                    " gra.tipo_grau AS tipo_grau, gra.notas_parciais AS notas_parciais, gra.media_sem_exame AS media_sem_exame, gra.media_final AS media_final, gra.nota_maxima AS nota_maxima, " +
                    " gra.recuperacao AS recuperacao, gra.manual AS manual, gra.manual_aluno AS manual_aluno, gra.peso_distinto AS peso_distinto, gra.frequencia_minima AS frequencia_minima, gra.id AS grau_id " +
                    " FROM edc_oferecimento_componente_curricular off " +
                    " INNER JOIN edc_professor p ON p.id = off.id_professor " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " LEFT JOIN edc_grupo grp ON grp.id = off.id_grupo " +
                    " INNER JOIN edc_curriculo cur ON cur.id = off.id_curso " +
                    " INNER JOIN edc_curso c ON c.id = cur.id_curso " +
                    " INNER JOIN edc_componente_curricular cc ON cc.id = off.id_componente_curricular " +
                    " INNER JOIN edc_grau gra ON gra.id = cur.id_grau " +
                    " WHERE off.id = ?1";

    private static final String SQL_GRAU_NOTAS =
            "SELECT gn.id AS id, gn.nome AS nome, gn.descricao AS descricao, gn.numero_nota AS numero_nota, gn.qtde_nota AS qtde_nota, gn.peso AS peso " +
                    " FROM edc_grau_nota gn WHERE gn.id_grau = ?1 ORDER BY gn.numero_nota";

    private static final String SQL_GRAU_CONCEITOS =
            "SELECT gc.id AS id, gc.nome AS nome, gc.descricao AS descricao, gc.conceito AS conceito, gc.ordem AS ordem, gc.qtde_nota AS qtde_nota " +
                    " FROM edc_grau_conceito gc WHERE gc.id_grau = ?1 ORDER BY gc.ordem";

    private static final String SQL_AVALIACOES =
            "SELECT ncm.id AS avaliacao_id, m.id AS matricula_id, COALESCE(pf.nome, pj.nome_fantasia, '') AS aluno_nome, ncm.id_grau_nota AS grau_nota_id, ncm.id_grau_conceito AS grau_conceito_id, " +
                    " ncm.nota AS nota_valor, ncm.id_conceito_notas AS conceito_notas_id, " +
                    " n.id AS nota_id, n.nota AS nota_detalhe_valor, COALESCE(ng.nome, nm.nome, '') AS nota_nome " +
                    " FROM edc_nota_componente_curricular_matricula ncm " +
                    " INNER JOIN edc_matricula m ON m.id = ncm.id_matricula " +
                    " INNER JOIN edc_contrato con ON con.id = m.id_contrato " +
                    " LEFT JOIN bas_pessoa pes ON pes.id = con.id_pessoa " +
                    " LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                    " LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = pes.id " +
                    " LEFT JOIN edc_nota n ON n.id_nota_componente_curricular_matricula = ncm.id " +
                    " LEFT JOIN edc_nota_grau ng ON ng.id = n.id_nota_grau " +
                    " LEFT JOIN edc_nota_matricula nm ON nm.id = n.id_nota_matricula " +
                    " WHERE m.id_oferecimento_componente_curricular = ?1 " +
                    " ORDER BY lower(COALESCE(pf.nome, pj.nome_fantasia, '')), m.id, ncm.id_grau_nota, n.id";

    private static final String SQL_REGISTROS =
            "SELECT r.id AS registro_id, o.id AS ocorrencia_id, o.data AS data, COALESCE(r.descricao, '') AS descricao " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " LEFT JOIN edc_registro_aula r ON r.id_ocorrencia_componente_curricular = o.id " +
                    " WHERE o.id_oferecimento_componente_curricular = ?1 AND o.fl_ativo = true AND o.data < current_date " +
                    " ORDER BY o.data DESC";

    private static final String SQL_PENDENCIAS =
            "SELECT comp.sucinto AS componente_sucinto, off.id AS oferecimento_id, count(ccc.presenca) AS total " +
                    " FROM edc_caderno_componente_curricular ccc " +
                    " INNER JOIN edc_ocorrencia_componente_curricular o ON o.id = ccc.id_ocorrencia_componente_curricular " +
                    " INNER JOIN edc_oferecimento_componente_curricular off ON off.id = o.id_oferecimento_componente_curricular " +
                    " INNER JOIN edc_componente_curricular comp ON comp.id = off.id_componente_curricular " +
                    " INNER JOIN edc_professor p ON p.id = off.id_professor " +
                    " WHERE ccc.presenca = 'n' AND o.data < current_date AND p.id_pessoa = ?1 " +
                    " GROUP BY comp.sucinto, off.id ORDER BY count(ccc.presenca) DESC";

    private Uni<List<Tuple>> nativeQuery(String sql, Object... params) {
        return Panache.getSession().chain(session -> {
            Mutiny.SelectionQuery<Tuple> q = session.createNativeQuery(sql, Tuple.class);
            for (int i = 0; i < params.length; i++) {
                q.setParameter(i + 1, params[i]);
            }
            return q.getResultList();
        });
    }

    public Uni<List<TurmaDto>> listarTurmas(Long professorId) {
        if (professorId == null) {
            return nativeQuery(SQL_TURMA.replace(" INNER JOIN edc_professor p ON p.id = off.id_professor ", " LEFT JOIN edc_professor p ON p.id = off.id_professor ")).map(rows -> rows.stream().map(this::mapTurma).toList());
        }
        return nativeQuery(SQL_TURMAS, professorId).map(rows -> rows.stream().map(this::mapTurma).toList());
    }

    public Uni<CadernoDto> buscarCaderno(Long turmaId) {
        return nativeQuery(SQL_TURMA + " WHERE off.id = ?1", turmaId).chain(rows -> {
            if (rows.isEmpty()) {
                return Uni.createFrom().failure(new NotFoundException("Turma não encontrada"));
            }
            TurmaDto turma = mapTurma(rows.get(0));
            Uni<List<Tuple>> ocorrencias = nativeQuery(SQL_OCORRENCIAS, turmaId);
            Uni<List<Tuple>> alunos = nativeQuery(SQL_ALUNOS, turmaId);
            return Uni.combine().all().unis(ocorrencias, alunos).asTuple()
                    .map(t -> buildCaderno(turma, t.getItem1(), t.getItem2()));
        });
    }

    public Uni<NotasDto> buscarNotas(Long turmaId) {
        return nativeQuery(SQL_TURMA_COM_GRAU, turmaId).chain(rows -> {
            if (rows.isEmpty()) {
                return Uni.createFrom().failure(new NotFoundException("Turma não encontrada"));
            }
            Tuple r = rows.get(0);
            Long grauId = TupleHelper.getLong(r, "grau_id");
            Uni<List<Tuple>> grauNotas = nativeQuery(SQL_GRAU_NOTAS, grauId);
            Uni<List<Tuple>> grauConceitos = nativeQuery(SQL_GRAU_CONCEITOS, grauId);
            Uni<List<Tuple>> avaliacoes = nativeQuery(SQL_AVALIACOES, turmaId);
            return Uni.combine().all().unis(grauNotas, grauConceitos, avaliacoes).asTuple()
                    .map(t -> buildNotas(r, t.getItem1(), t.getItem2(), t.getItem3()));
        });
    }

    public Uni<List<RegistroDto>> buscarRegistros(Long turmaId) {
        return nativeQuery(SQL_REGISTROS, turmaId).map(rows -> rows.stream().map(r ->
                new RegistroDto(TupleHelper.getLong(r, "registro_id"), TupleHelper.getLong(r, "ocorrencia_id"), formatData(TupleHelper.get(r, "data")), TupleHelper.getString(r, "descricao"))).toList());
    }

    public Uni<InformacoesDto> buscarInformacoes(Long turmaId) {
        return nativeQuery(SQL_INFO_TURMA, turmaId).chain(rows -> {
            if (rows.isEmpty()) {
                return Uni.createFrom().failure(new NotFoundException("Turma não encontrada"));
            }
            Tuple r = rows.get(0);
            Uni<List<Tuple>> diasAula = nativeQuery(SQL_INFO_DIAS_AULA, turmaId);
            Uni<List<Tuple>> alunos = nativeQuery(SQL_INFO_ALUNOS, turmaId);
            return Uni.combine().all().unis(diasAula, alunos).asTuple()
                    .map(t -> buildInformacoes(r, t.getItem1(), t.getItem2()));
        });
    }

    public Uni<List<PendenciaDto>> listarPendencias(Long pessoaId) {
        return nativeQuery(SQL_PENDENCIAS, pessoaId).map(rows -> rows.stream().map(r ->
                new PendenciaDto(TupleHelper.getString(r, "componente_sucinto"), TupleHelper.getString(r, "oferecimento_id"), TupleHelper.getLong(r, "total"))).toList());
    }

    public Uni<IdentidadeDto> identidade(String username) {
        String sql = """
            SELECT p.id
            FROM edc_professor p
            INNER JOIN bas_usuario u ON u.id_pessoa = p.id_pessoa
            WHERE lower(u.login) = lower(?1)
            LIMIT 1
            """;
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, username)
                        .getSingleResultOrNull())
                .map(result -> result != null ? new IdentidadeDto(true, ((Number) result).longValue()) : new IdentidadeDto(false, null));
    }

    public Uni<Void> salvarChamada(SalvarChamadaRequest request) {
        if (request == null || request.presencas() == null || request.presencas().isEmpty()) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession().chain(session -> {
            Uni<Void> acc = Uni.createFrom().voidItem();
            for (SalvarChamadaRequest.PresencaSalvarDto p : request.presencas()) {
                acc = acc.chain(v -> salvarPresenca(session, p, request.usuarioId()));
            }
            return acc;
        });
    }

    public Uni<Void> salvarNotas(SalvarNotasRequest request) {
        if (request == null || request.avaliacoes() == null || request.avaliacoes().isEmpty()) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession().chain(session -> {
            Uni<Void> acc = Uni.createFrom().voidItem();
            for (SalvarNotasRequest.NotaSalvarDto a : request.avaliacoes()) {
                acc = acc.chain(v -> salvarAvaliacao(session, a));
            }
            return acc;
        });
    }

    public Uni<Void> salvarRegistro(SalvarRegistroRequest request) {
        if (request == null || request.registros() == null || request.registros().isEmpty()) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession().chain(session -> {
            Uni<Void> acc = Uni.createFrom().voidItem();
            for (SalvarRegistroRequest.RegistroSalvarDto r : request.registros()) {
                acc = acc.chain(v -> salvarRegistroItem(session, r));
            }
            return acc;
        });
    }

    private Uni<Void> salvarPresenca(Mutiny.Session session, SalvarChamadaRequest.PresencaSalvarDto p, Long usuarioId) {
        if (p.id() == null) {
            return Uni.createFrom().voidItem();
        }
        // A matricula e a ocorrencia sao lidas da propria linha do caderno em
        // vez de vir do payload: assim o historico nunca registra a matricula
        // errada e nunca chega null no INSERT (ver inserirHistoricoChamada).
        return session.createNativeQuery(
                        "SELECT presenca AS presenca, id_matricula AS matricula_id, id_ocorrencia_componente_curricular AS ocorrencia_id "
                                + "FROM edc_caderno_componente_curricular WHERE id = ?1", Tuple.class)
                .setParameter(1, p.id()).getResultList()
                .chain(list -> {
                    if (list == null || list.isEmpty() || list.get(0) == null) {
                        return Uni.createFrom().voidItem();
                    }
                    Tuple linha = (Tuple) list.get(0);
                    String anterior = TupleHelper.getString(linha, "presenca") == null ? null : TupleHelper.getString(linha, "presenca").trim();
                    String nova = p.presenca() == null ? "" : p.presenca().trim();
                    Uni<Integer> update = session.createNativeQuery(
                            "UPDATE edc_caderno_componente_curricular SET presenca = ?1, data_alteracao = current_date WHERE id = ?2")
                            .setParameter(1, nova).setParameter(2, p.id()).executeUpdate();
                    if (anterior != null && !anterior.equals(nova)) {
                        return update.chain(v -> inserirHistoricoChamada(session, usuarioId,
                                        TupleHelper.getLong(linha, "matricula_id"), TupleHelper.getLong(linha, "ocorrencia_id"), anterior, nova))
                                .replaceWithVoid();
                    }
                    return update.replaceWithVoid();
                });
    }

    // O Hibernate Reactive nao consegue bindar parametro null: o
    // PreparedStatementAdaptor dele nao implementa getParameterMetaData, que e
    // justamente o que o Hibernate usa para descobrir o tipo JDBC de um null
    // (UnsupportedOperationException -> HTTP 500). Por isso id_usuario so entra
    // no INSERT quando veio preenchido; sem usuario a coluna fica NULL.
    private Uni<Integer> inserirHistoricoChamada(Mutiny.Session session, Long usuarioId, Long matriculaId,
                                                  Long ocorrenciaId, String anterior, String nova) {
        if (usuarioId == null) {
            return session.createNativeQuery(
                            "INSERT INTO edc_historico_caderno_chamada (data, id_matricula, id_ocorrencia_componente_curricular, presenca_anterior, presenca_posterior) "
                                    + "VALUES (now(), ?1, ?2, ?3, ?4)")
                    .setParameter(1, matriculaId).setParameter(2, ocorrenciaId)
                    .setParameter(3, anterior).setParameter(4, nova)
                    .executeUpdate();
        }
        return session.createNativeQuery(
                        "INSERT INTO edc_historico_caderno_chamada (id_usuario, data, id_matricula, id_ocorrencia_componente_curricular, presenca_anterior, presenca_posterior) "
                                + "VALUES (?1, now(), ?2, ?3, ?4, ?5)")
                .setParameter(1, usuarioId).setParameter(2, matriculaId)
                .setParameter(3, ocorrenciaId).setParameter(4, anterior).setParameter(5, nova)
                .executeUpdate();
    }

    private Uni<Void> salvarAvaliacao(Mutiny.Session session, SalvarNotasRequest.NotaSalvarDto a) {
        Uni<Void> acc = Uni.createFrom().voidItem();
        if (a.id() != null) {
            acc = acc.chain(v -> atualizarNotaComponente(session, a.id(), a.nota(), a.notaConceitoId()).replaceWithVoid());
        }
        if (a.notas() != null) {
            for (SalvarNotasRequest.NotaValorDto n : a.notas()) {
                acc = acc.chain(v -> atualizarNota(session, n.id(), n.valor()).replaceWithVoid());
            }
        }
        return acc;
    }

    private Uni<Integer> atualizarNotaComponente(Mutiny.Session session, Long id, Double nota, Long conceitoId) {
        boolean n = nota != null;
        boolean c = conceitoId != null;
        String sql;
        int idx = 1;
        if (n && c) {
            sql = "UPDATE edc_nota_componente_curricular_matricula SET nota = ?1, id_conceito_notas = ?2 WHERE id = ?3";
        } else if (n) {
            sql = "UPDATE edc_nota_componente_curricular_matricula SET nota = ?1, id_conceito_notas = NULL WHERE id = ?2";
        } else if (c) {
            sql = "UPDATE edc_nota_componente_curricular_matricula SET nota = NULL, id_conceito_notas = ?1 WHERE id = ?2";
        } else {
            sql = "UPDATE edc_nota_componente_curricular_matricula SET nota = NULL, id_conceito_notas = NULL WHERE id = ?1";
        }
        Mutiny.Query<Object> q = session.createNativeQuery(sql);
        if (n) {
            q.setParameter(idx++, nota);
        }
        if (c) {
            q.setParameter(idx++, conceitoId);
        }
        q.setParameter(idx, id);
        return q.executeUpdate();
    }

    private Uni<Integer> atualizarNota(Mutiny.Session session, Long id, Double valor) {
        if (id == null) {
            return Uni.createFrom().item(0);
        }
        if (valor == null) {
            return session.createNativeQuery("UPDATE edc_nota SET nota = NULL WHERE id = ?1")
                    .setParameter(1, id).executeUpdate();
        }
        return session.createNativeQuery("UPDATE edc_nota SET nota = ?1 WHERE id = ?2")
                .setParameter(1, BigDecimal.valueOf(valor)).setParameter(2, id).executeUpdate();
    }

    private Uni<Void> salvarRegistroItem(Mutiny.Session session, SalvarRegistroRequest.RegistroSalvarDto r) {
        // Mesma limitacao do Hibernate Reactive com parametro null (ver
        // inserirHistoricoChamada): null no bind estoura com HTTP 500, entao
        // quem nao tiver texto vira string vazia.
        String descricao = r.descricao() == null ? "" : r.descricao();
        if (r.id() != null) {
            return session.createNativeQuery("UPDATE edc_registro_aula SET descricao = ?1 WHERE id = ?2")
                    .setParameter(1, descricao).setParameter(2, r.id()).executeUpdate().replaceWithVoid();
        }
        if (r.ocorrenciaId() != null) {
            return session.createNativeQuery("INSERT INTO edc_registro_aula (id_ocorrencia_componente_curricular, descricao) VALUES (?1, ?2)")
                    .setParameter(1, r.ocorrenciaId()).setParameter(2, descricao).executeUpdate().replaceWithVoid();
        }
        return Uni.createFrom().voidItem();
    }

    private CadernoDto buildCaderno(TurmaDto turma, List<Tuple> ocorrenciasRows, List<Tuple> alunosRows) {
        List<OcorrenciaDto> ocorrencias = ocorrenciasRows.stream()
                .map(r -> new OcorrenciaDto(TupleHelper.getLong(r, "id"), formatData(TupleHelper.get(r, "data")), toBool(TupleHelper.get(r, "ativo")))).toList();
        Map<Long, AlunoDto> mapa = new LinkedHashMap<>();
        for (Tuple r : alunosRows) {
            Long matriculaId = TupleHelper.getLong(r, "matricula_id");
            AlunoDto aluno = mapa.computeIfAbsent(matriculaId,
                    id -> new AlunoDto(id, TupleHelper.getString(r, "aluno_nome"), toBool(TupleHelper.get(r, "aluno_ativo")), new ArrayList<>()));
            aluno.presencas().add(new PresencaDto(TupleHelper.getLong(r, "caderno_id"), TupleHelper.getLong(r, "ocorrencia_id"), formatData(TupleHelper.get(r, "ocorrencia_data")), TupleHelper.getString(r, "presenca")));
        }
        return new CadernoDto(turma, ocorrencias, new ArrayList<>(mapa.values()));
    }

    private NotasDto buildNotas(Tuple r, List<Tuple> grauNotasRows, List<Tuple> grauConceitosRows,
                                List<Tuple> avaliacoesRows) {
        TurmaDto turma = mapTurma(r);
        List<GrauNotaDto> grauNotas = grauNotasRows.stream()
                .map(x -> new GrauNotaDto(TupleHelper.getLong(x, "id"), TupleHelper.getString(x, "nome"), TupleHelper.getString(x, "descricao"), TupleHelper.getInteger(x, "numero_nota"), TupleHelper.getInteger(x, "qtde_nota"), toDouble(TupleHelper.get(x, "peso"))))
                .toList();
        List<GrauConceitoDto> grauConceitos = grauConceitosRows.stream()
                .map(x -> new GrauConceitoDto(TupleHelper.getLong(x, "id"), TupleHelper.getString(x, "nome"), TupleHelper.getString(x, "descricao"), TupleHelper.getString(x, "conceito"), TupleHelper.getInteger(x, "ordem"), TupleHelper.getInteger(x, "qtde_nota")))
                .toList();
        Map<Long, NotaAlunoDto> mapa = new LinkedHashMap<>();
        for (Tuple x : avaliacoesRows) {
            Long id = TupleHelper.getLong(x, "avaliacao_id");
            NotaAlunoDto ava = mapa.computeIfAbsent(id, k -> new NotaAlunoDto(id, TupleHelper.getLong(x, "matricula_id"), TupleHelper.getString(x, "aluno_nome"),
                    TupleHelper.getLong(x, "grau_nota_id"), TupleHelper.getLong(x, "grau_conceito_id"), toDouble(TupleHelper.get(x, "nota_valor")), TupleHelper.getLong(x, "conceito_notas_id"), new ArrayList<>()));
            if (TupleHelper.get(x, "nota_id") != null) {
                ava.notas().add(new NotaDto(TupleHelper.getLong(x, "nota_id"), TupleHelper.getString(x, "nota_nome"), toDouble(TupleHelper.get(x, "nota_detalhe_valor"))));
            }
        }
        return new NotasDto(turma, TupleHelper.getString(r, "status"), TupleHelper.getInteger(r, "notas_parciais"), toDouble(TupleHelper.get(r, "media_sem_exame")), toDouble(TupleHelper.get(r, "media_final")), toDouble(TupleHelper.get(r, "nota_maxima")),
                toBool(TupleHelper.get(r, "recuperacao")), toBool(TupleHelper.get(r, "manual")), toBool(TupleHelper.get(r, "manual_aluno")), toBool(TupleHelper.get(r, "peso_distinto")), toDouble(TupleHelper.get(r, "frequencia_minima")),
                grauNotas, grauConceitos, new ArrayList<>(mapa.values()));
    }

    private InformacoesDto buildInformacoes(Tuple r, List<Tuple> diasRows, List<Tuple> alunosRows) {
        List<InformacoesDto.DiaAulaDto> dias = diasRows.stream()
                .map(x -> new InformacoesDto.DiaAulaDto(formatData(TupleHelper.get(x, "data")), TupleHelper.getString(x, "dia_semana"),
                        formatTurno(TupleHelper.get(x, "inicio"), TupleHelper.get(x, "fim")))).toList();
        String salas = diasRows.stream()
                .map(x -> TupleHelper.getLong(x, "sala_numero"))
                .filter(n -> n != null && n != 0)
                .distinct()
                .map(String::valueOf)
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
        List<InformacoesDto.AlunoInfoDto> alunos = alunosRows.stream()
                .map(x -> new InformacoesDto.AlunoInfoDto(TupleHelper.getLong(x, "matricula_id"), TupleHelper.getString(x, "aluno_nome"), TupleHelper.getString(x, "aluno_cpf"),
                        TupleHelper.getString(x, "telefone"), TupleHelper.getString(x, "celular"), TupleHelper.getString(x, "responsavel_nome"), TupleHelper.getString(x, "responsavel_cpf"), TupleHelper.getString(x, "responsavel_telefone"), TupleHelper.getString(x, "responsavel_celular"))).toList();
        return new InformacoesDto(TupleHelper.getLong(r, "id"), TupleHelper.getString(r, "professor_nome"), TupleHelper.getString(r, "telefone"), TupleHelper.getString(r, "celular"), TupleHelper.getString(r, "email"),
                TupleHelper.getString(r, "unidade_sucinto"), salas, TupleHelper.getString(r, "grupo_nome"), TupleHelper.getString(r, "curso_nome"), TupleHelper.getString(r, "componente_descricao"), TupleHelper.getString(r, "status"), dias, alunos);
    }

    private String formatTurno(Object inicio, Object fim) {
        String ini = formatHora(inicio);
        String end = formatHora(fim);
        if (ini.isEmpty() && end.isEmpty()) {
            return "";
        }
        return ini + " até " + end;
    }

    private String formatHora(Object value) {
        if (value == null) {
            return "";
        }
        String s = String.valueOf(value);
        return s.length() >= 5 ? s.substring(0, 5) : s;
    }

    private TurmaDto mapTurma(Tuple r) {
        return new TurmaDto(TupleHelper.getLong(r, "id"), TupleHelper.getString(r, "professor_nome"), TupleHelper.getString(r, "grupo_nome"), TupleHelper.getString(r, "curso_nome"), TupleHelper.getString(r, "componente_descricao"), TupleHelper.getString(r, "status"));
    }

    private String formatData(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof java.util.Date date){
            return DIA.format(date);
        }
        return String.valueOf(value);
    }

    private Long toLong(Object value) {
        return value == null ? null : ((Number) value).longValue();
    }

    private Integer toInt(Object value) {
        return value == null ? null : ((Number) value).intValue();
    }

    private Double toDouble(Object value) {
        return value == null ? null : ((Number) value).doubleValue();
    }

    private Boolean toBool(Object value) {
        return value != null && (Boolean) value;
    }

    private String toStr(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
