package br.com.sol7.olimpio.professor.gestao.service;

import br.com.sol7.olimpio.professor.gestao.dto.*;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
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
            "SELECT off.id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, ''), " +
                    " COALESCE(grp.nome, ''), " +
                    " COALESCE(c.nome, ''), " +
                    " COALESCE(cc.descricao, ''), " +
                    " COALESCE(off.status, '') " +
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
            "SELECT DISTINCT o.id, o.data, o.fl_ativo " +
                    " FROM edc_caderno_componente_curricular c " +
                    " INNER JOIN edc_ocorrencia_componente_curricular o ON o.id = c.id_ocorrencia_componente_curricular " +
                    " WHERE o.id_oferecimento_componente_curricular = ?1 " +
                    " AND o.fl_ativo = true " +
                    " AND c.presenca IN ('n','a','m','p','t') " +
                    " ORDER BY o.data, o.id";

    private static final String SQL_ALUNOS =
            "SELECT m.id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, ''), " +
                    " (m.status = 'CURSANDO' AND con.ativo = true) AS ativo, " +
                    " ccc.id, o.id, o.data, ccc.presenca " +
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

    private static final String SQL_TURMA_COM_GRAU =
            "SELECT off.id, " +
                    " COALESCE(pf.nome, pj.nome_fantasia, ''), " +
                    " COALESCE(grp.nome, ''), " +
                    " COALESCE(c.nome, ''), " +
                    " COALESCE(cc.descricao, ''), " +
                    " COALESCE(off.status, ''), " +
                    " gra.tipo_grau, gra.notas_parciais, gra.media_sem_exame, gra.media_final, gra.nota_maxima, " +
                    " gra.recuperacao, gra.manual, gra.manual_aluno, gra.peso_distinto, gra.frequencia_minima, gra.id " +
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
            "SELECT gn.id, gn.nome, gn.descricao, gn.numero_nota, gn.qtde_nota, gn.peso " +
                    " FROM edc_grau_nota gn WHERE gn.id_grau = ?1 ORDER BY gn.numero_nota";

    private static final String SQL_GRAU_CONCEITOS =
            "SELECT gc.id, gc.nome, gc.descricao, gc.conceito, gc.ordem, gc.qtde_nota " +
                    " FROM edc_grau_conceito gc WHERE gc.id_grau = ?1 ORDER BY gc.ordem";

    private static final String SQL_AVALIACOES =
            "SELECT ncm.id, m.id, COALESCE(pf.nome, pj.nome_fantasia, ''), ncm.id_grau_nota, ncm.id_grau_conceito, " +
                    " ncm.nota, ncm.id_conceito_notas, " +
                    " n.id, n.nota, COALESCE(ng.nome, nm.nome, '') " +
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
            "SELECT r.id, o.id, o.data, COALESCE(r.descricao, '') " +
                    " FROM edc_ocorrencia_componente_curricular o " +
                    " LEFT JOIN edc_registro_aula r ON r.id_ocorrencia_componente_curricular = o.id " +
                    " WHERE o.id_oferecimento_componente_curricular = ?1 AND o.fl_ativo = true AND o.data < current_date " +
                    " ORDER BY o.data DESC";

    private static final String SQL_PENDENCIAS =
            "SELECT comp.sucinto, off.id, count(ccc.presenca) " +
                    " FROM edc_caderno_componente_curricular ccc " +
                    " INNER JOIN edc_ocorrencia_componente_curricular o ON o.id = ccc.id_ocorrencia_componente_curricular " +
                    " INNER JOIN edc_oferecimento_componente_curricular off ON off.id = o.id_oferecimento_componente_curricular " +
                    " INNER JOIN edc_componente_curricular comp ON comp.id = off.id_componente_curricular " +
                    " INNER JOIN edc_professor p ON p.id = off.id_professor " +
                    " WHERE ccc.presenca = 'n' AND o.data < current_date AND p.id_pessoa = ?1 " +
                    " GROUP BY comp.sucinto, off.id ORDER BY count(ccc.presenca) DESC";

    private Uni<List<Object[]>> nativeQuery(String sql, Object... params) {
        return Panache.getSession().chain(session -> {
            Mutiny.Query<Object> q = session.createNativeQuery(sql);
            for (int i = 0; i < params.length; i++) {
                q.setParameter(i + 1, params[i]);
            }
            return q.getResultList()
                    .map(list -> list.stream().map(row -> (Object[]) row).toList());
        });
    }

public Uni<List<TurmaDto>> listarTurmas(Long professorId) {
        if (professorId == null) {
            return nativeQuery(SQL_TURMA.replace("INNER JOIN edc_professor p ON p.id = off.id_professor ", "LEFT JOIN edc_professor p ON p.id = off.id_professor ")).map(rows -> rows.stream().map(this::mapTurma).toList());
        }
        return nativeQuery(SQL_TURMAS, professorId).map(rows -> rows.stream().map(this::mapTurma).toList());
      }

    public Uni<CadernoDto> buscarCaderno(Long turmaId) {
        return nativeQuery(SQL_TURMA + " WHERE off.id = ?1", turmaId).chain(rows -> {
            if (rows.isEmpty()) {
                return Uni.createFrom().failure(new NotFoundException("Turma não encontrada"));
            }
            TurmaDto turma = mapTurma(rows.get(0));
            Uni<List<Object[]>> ocorrencias = nativeQuery(SQL_OCORRENCIAS, turmaId);
            Uni<List<Object[]>> alunos = nativeQuery(SQL_ALUNOS, turmaId);
            return Uni.combine().all().unis(ocorrencias, alunos).asTuple()
                    .map(t -> buildCaderno(turma, t.getItem1(), t.getItem2()));
        });
    }

    public Uni<NotasDto> buscarNotas(Long turmaId) {
        return nativeQuery(SQL_TURMA_COM_GRAU, turmaId).chain(rows -> {
            if (rows.isEmpty()) {
                return Uni.createFrom().failure(new NotFoundException("Turma não encontrada"));
            }
            Object[] r = rows.get(0);
            Long grauId = toLong(r[16]);
            Uni<List<Object[]>> grauNotas = nativeQuery(SQL_GRAU_NOTAS, grauId);
            Uni<List<Object[]>> grauConceitos = nativeQuery(SQL_GRAU_CONCEITOS, grauId);
            Uni<List<Object[]>> avaliacoes = nativeQuery(SQL_AVALIACOES, turmaId);
            return Uni.combine().all().unis(grauNotas, grauConceitos, avaliacoes).asTuple()
                    .map(t -> buildNotas(r, t.getItem1(), t.getItem2(), t.getItem3()));
        });
    }

    public Uni<List<RegistroDto>> buscarRegistros(Long turmaId) {
        return nativeQuery(SQL_REGISTROS, turmaId).map(rows -> rows.stream().map(r ->
                new RegistroDto(toLong(r[0]), toLong(r[1]), formatData(r[2]), toStr(r[3]))).toList());
    }

    public Uni<List<PendenciaDto>> listarPendencias(Long pessoaId) {
        return nativeQuery(SQL_PENDENCIAS, pessoaId).map(rows -> rows.stream().map(r ->
                new PendenciaDto(toStr(r[0]), toStr(r[1]), toLong(r[2]))).toList());
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
        return session.createNativeQuery("SELECT presenca FROM edc_caderno_componente_curricular WHERE id = ?1")
                .setParameter(1, p.id()).getResultList()
                .chain(list -> {
                    String anterior = (list == null || list.isEmpty() || list.get(0) == null)
                            ? null : String.valueOf(list.get(0));
                    String nova = p.presenca();
                    Uni<Integer> update = session.createNativeQuery(
                                    "UPDATE edc_caderno_componente_curricular SET presenca = ?1, data_alteracao = now() WHERE id = ?2")
                            .setParameter(1, nova).setParameter(2, p.id()).executeUpdate();
                    if (anterior != null && !anterior.equals(nova)) {
                        return update.chain(v -> session.createNativeQuery(
                                        "INSERT INTO edc_historico_caderno_chamada (id_usuario, data, id_matricula, id_ocorrencia_componente_curricular, presenca_anterior, presenca_posterior) VALUES (?1, now(), ?2, ?3, ?4, ?5)")
                                .setParameter(1, usuarioId).setParameter(2, p.matriculaId())
                                .setParameter(3, p.ocorrenciaId())
                                .setParameter(4, anterior).setParameter(5, nova)
                                .executeUpdate()).replaceWithVoid();
                    }
                    return update.replaceWithVoid();
                });
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
        if (r.id() != null) {
            return session.createNativeQuery("UPDATE edc_registro_aula SET descricao = ?1 WHERE id = ?2")
                    .setParameter(1, r.descricao()).setParameter(2, r.id()).executeUpdate().replaceWithVoid();
        }
        if (r.ocorrenciaId() != null) {
            return session.createNativeQuery("INSERT INTO edc_registro_aula (id_ocorrencia_componente_curricular, descricao) VALUES (?1, ?2)")
                    .setParameter(1, r.ocorrenciaId()).setParameter(2, r.descricao()).executeUpdate().replaceWithVoid();
        }
        return Uni.createFrom().voidItem();
    }

    private CadernoDto buildCaderno(TurmaDto turma, List<Object[]> ocorrenciasRows, List<Object[]> alunosRows) {
        List<OcorrenciaDto> ocorrencias = ocorrenciasRows.stream()
                .map(r -> new OcorrenciaDto(toLong(r[0]), formatData(r[1]), toBool(r[2]))).toList();
        Map<Long, AlunoDto> mapa = new LinkedHashMap<>();
        for (Object[] r : alunosRows) {
            Long matriculaId = toLong(r[0]);
            AlunoDto aluno = mapa.computeIfAbsent(matriculaId,
                    id -> new AlunoDto(id, toStr(r[1]), toBool(r[2]), new ArrayList<>()));
            aluno.presencas().add(new PresencaDto(toLong(r[3]), toLong(r[4]), formatData(r[5]), toStr(r[6])));
        }
        return new CadernoDto(turma, ocorrencias, new ArrayList<>(mapa.values()));
    }

    private NotasDto buildNotas(Object[] r, List<Object[]> grauNotasRows, List<Object[]> grauConceitosRows,
                                List<Object[]> avaliacoesRows) {
        TurmaDto turma = mapTurma(r);
        List<GrauNotaDto> grauNotas = grauNotasRows.stream()
                .map(x -> new GrauNotaDto(toLong(x[0]), toStr(x[1]), toStr(x[2]), toInt(x[3]), toInt(x[4]), toDouble(x[5])))
                .toList();
        List<GrauConceitoDto> grauConceitos = grauConceitosRows.stream()
                .map(x -> new GrauConceitoDto(toLong(x[0]), toStr(x[1]), toStr(x[2]), toStr(x[3]), toInt(x[4]), toInt(x[5])))
                .toList();
        Map<Long, NotaAlunoDto> mapa = new LinkedHashMap<>();
        for (Object[] x : avaliacoesRows) {
            Long id = toLong(x[0]);
            NotaAlunoDto ava = mapa.computeIfAbsent(id, k -> new NotaAlunoDto(id, toLong(x[1]), toStr(x[2]),
                    toLong(x[3]), toLong(x[4]), toDouble(x[5]), toLong(x[6]), new ArrayList<>()));
            if (x[7] != null) {
                ava.notas().add(new NotaDto(toLong(x[7]), toStr(x[9]), toDouble(x[8])));
            }
        }
        return new NotasDto(turma, toStr(r[6]), toInt(r[7]), toDouble(r[8]), toDouble(r[9]), toDouble(r[10]),
                toBool(r[11]), toBool(r[12]), toBool(r[13]), toBool(r[14]), toDouble(r[15]),
                grauNotas, grauConceitos, new ArrayList<>(mapa.values()));
    }

    private TurmaDto mapTurma(Object[] r) {
        return new TurmaDto(toLong(r[0]), toStr(r[1]), toStr(r[2]), toStr(r[3]), toStr(r[4]), toStr(r[5]));
    }

    private String formatData(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof Date date) {
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
