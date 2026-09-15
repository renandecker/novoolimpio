package br.com.sol7.olimpio.educacao.digitalizacao;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;
import br.com.sol7.olimpio.shared.TupleHelper;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class DigitalizacaoService {
    @Inject
    Mutiny.SessionFactory sessionFactory;

    public Uni<List<TurmaOption>> turmasDisponiveis(String query, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        String sql = "SELECT occ.id AS id, occ.sequencia AS sequencia, cc.descricao AS componente, u.sucinto AS unidade, " +
                "cur.nome AS curso, occ.data_inicio AS data_inicio, occ.data_fim AS data_fim " +
                "FROM edc_oferecimento_componente_curricular occ " +
                "LEFT JOIN edc_componente_curricular cc ON cc.id = occ.id_componente_curricular " +
                "LEFT JOIN bas_unidade u ON u.id = occ.id_unidade " +
                "LEFT JOIN edc_curriculo cur ON cur.id = occ.id_curso " +
                "LEFT JOIN edc_curso curso ON curso.id = cur.id_curso " +
                "WHERE u.id IN :unidadesIds " +
                "AND (lower(cc.descricao) LIKE '%' || :query || '%' " +
                "OR lower(curso.nome) LIKE '%' || :query || '%' " +
                "OR CAST(occ.id AS text) LIKE '%' || :query || '%') " +
                "AND occ.fl_registra_frequencia = true " +
                "ORDER BY occ.data_inicio DESC LIMIT 20";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql, Tuple.class)
                .setParameter("unidadesIds", unidadesIds)
                .setParameter("query", query.toLowerCase())
                .getResultList())
                .map(list -> list.stream().map(row -> {
                    Tuple t = (Tuple) row;
                    return new TurmaOption(
                            TupleHelper.getLong(t, "id"),
                            TupleHelper.getInteger(t, "sequencia"),
                            TupleHelper.getString(t, "componente"),
                            TupleHelper.getString(t, "unidade"),
                            TupleHelper.getString(t, "curso"),
                            TupleHelper.getDate(t, "data_inicio"),
                            TupleHelper.getDate(t, "data_fim")
                    );
                }).collect(Collectors.toList()));
    }

    public Uni<CarregarDiasAulaResponse> carregarDiasAula(Long oferecimentoComponenteCurricularId) {
        String sqlOcorrencias = "SELECT o.id, o.data, o.id_dia_aula " +
                "FROM edc_ocorrencia_componente_curricular o " +
                "WHERE o.id_oferecimento_componente_curricular = ?1 " +
                "AND o.fl_ativo = true " +
                "ORDER BY o.data";
        String sqlChamadas = "SELECT dc.id, dc.local, dc.fl_pdf, dc.id_chamada_assinada_impressa, " +
                "cai.sequencia, cai.inicio, cai.fim, cai.ativo " +
                "FROM edc_digitalizacao_chamada dc " +
                "LEFT JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id_oferecimento_componente_curricular = ?1 " +
                "ORDER BY cai.sequencia";
        String sqlMatriculas = "SELECT m.id, c.id_pessoa, pf.nome " +
                "FROM edc_matricula m " +
                "JOIN edc_contrato c ON c.id = m.id_contrato " +
                "JOIN bas_pessoa p ON p.id = c.id_pessoa " +
                "JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                "WHERE m.id_oferecimento_componente_curricular = ?1 " +
                "AND m.data_cancelamento IS NULL " +
                "ORDER BY pf.nome";

        return sessionFactory.withSession(session -> {
            Uni<List<OcorrenciaItem>> ocorrencias = session.createNativeQuery(sqlOcorrencias, Tuple.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Tuple t = (Tuple) row;
                        return new OcorrenciaItem(
                                TupleHelper.getLong(t, "id"),
                                TupleHelper.getDate(t, "data"),
                                TupleHelper.getLong(t, "id_dia_aula")
                        );
                    }).collect(Collectors.toList()));

            Uni<List<ChamadaItem>> chamadas = session.createNativeQuery(sqlChamadas, Tuple.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Tuple t = (Tuple) row;
                        return new ChamadaItem(
                                TupleHelper.getLong(t, "id"),
                                TupleHelper.getString(t, "local"),
                                TupleHelper.getBoolean(t, "fl_pdf"),
                                TupleHelper.getLong(t, "id_chamada_assinada_impressa"),
                                TupleHelper.getInteger(t, "sequencia"),
                                TupleHelper.getDate(t, "inicio"),
                                TupleHelper.getDate(t, "fim"),
                                TupleHelper.getBoolean(t, "ativo")
                        );
                    }).collect(Collectors.toList()));

            Uni<List<MatriculaItem>> matriculas = session.createNativeQuery(sqlMatriculas, Tuple.class)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Tuple t = (Tuple) row;
                        return new MatriculaItem(
                                TupleHelper.getLong(t, "id"),
                                TupleHelper.getLong(t, "id_pessoa"),
                                TupleHelper.getString(t, "nome")
                        );
                    }).collect(Collectors.toList()));

            return Uni.combine().all().unis(ocorrencias, chamadas, matriculas)
                    .asTuple()
                    .map(tuple -> new CarregarDiasAulaResponse(tuple.getItem1(), tuple.getItem2(), tuple.getItem3()));
        });
    }

    public Uni<List<ChamadaItem>> digitalizacaoChamadas(Long oferecimentoComponenteCurricularId) {
        String sql = "SELECT dc.id AS id, dc.local AS local, dc.fl_pdf AS fl_pdf, dc.id_chamada_assinada_impressa AS id_chamada_assinada_impressa, " +
                "cai.sequencia AS sequencia, cai.inicio AS inicio, cai.fim AS fim, cai.ativo AS ativo " +
                "FROM edc_digitalizacao_chamada dc " +
                "LEFT JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id_oferecimento_componente_curricular = ?1 " +
                "ORDER BY cai.sequencia";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql, Tuple.class)
                .setParameter(1, oferecimentoComponenteCurricularId)
                .getResultList()
                .map(list -> list.stream().map(row -> {
                    Tuple t = (Tuple) row;
                    return new ChamadaItem(
                            TupleHelper.getLong(t, "id"),
                            TupleHelper.getString(t, "local"),
                            TupleHelper.getBoolean(t, "fl_pdf"),
                            TupleHelper.getLong(t, "id_chamada_assinada_impressa"),
                            TupleHelper.getInteger(t, "sequencia"),
                            TupleHelper.getDate(t, "inicio"),
                            TupleHelper.getDate(t, "fim"),
                            TupleHelper.getBoolean(t, "ativo")
                    );
                }).collect(Collectors.toList())));
    }

    public Uni<CarregarOcorrenciaResponse> carregarOcorrencia(Long digitalizacaoChamadaId) {
        String sqlOcorrencias = "SELECT o.id AS id, o.data AS data " +
                "FROM edc_ocorrencia_componente_curricular o " +
                "JOIN edc_digitalizacao_chamada dc ON dc.id_oferecimento_componente_curricular = o.id_oferecimento_componente_curricular " +
                "JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id = ?1 " +
                "AND o.fl_ativo = true " +
                "AND o.data BETWEEN cai.inicio AND cai.fim " +
                "ORDER BY o.data";
        String sqlCadernos = "SELECT c.id AS id, c.id_matricula AS id_matricula, c.id_ocorrencia_componente_curricular AS id_ocorrencia_componente_curricular, c.presenca AS presenca " +
                "FROM edc_caderno_componente_curricular c " +
                "JOIN edc_ocorrencia_componente_curricular o ON o.id = c.id_ocorrencia_componente_curricular " +
                "JOIN edc_digitalizacao_chamada dc ON dc.id_oferecimento_componente_curricular = o.id_oferecimento_componente_curricular " +
                "JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id = ?1 " +
                "AND o.data BETWEEN cai.inicio AND cai.fim";

        return sessionFactory.withSession(session -> {
            Uni<List<OcorrenciaGridItem>> ocorrencias = session.createNativeQuery(sqlOcorrencias, Tuple.class)
                    .setParameter(1, digitalizacaoChamadaId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Tuple t = (Tuple) row;
                        return new OcorrenciaGridItem(
                                TupleHelper.getLong(t, "id"),
                                TupleHelper.getDate(t, "data")
                        );
                    }).collect(Collectors.toList()));

            Uni<List<CadernoItem>> cadernos = session.createNativeQuery(sqlCadernos, Tuple.class)
                    .setParameter(1, digitalizacaoChamadaId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Tuple t = (Tuple) row;
                        return new CadernoItem(
                                TupleHelper.getLong(t, "id"),
                                TupleHelper.getLong(t, "id_matricula"),
                                TupleHelper.getLong(t, "id_ocorrencia_componente_curricular"),
                                TupleHelper.getString(t, "presenca")
                        );
                    }).collect(Collectors.toList()));

            return Uni.combine().all().unis(ocorrencias, cadernos)
                    .asTuple()
                    .map(tuple -> new CarregarOcorrenciaResponse(tuple.getItem1(), tuple.getItem2()));
        });
    }

    public Uni<List<AlunoOption>> autoCompleteAluno(String query, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        String sql = "SELECT DISTINCT p.id AS id, COALESCE(pf.nome, pj.nome_fantasia, '') AS nome, pf.cpf AS cpf, pj.cnpj AS cnpj " +
                "FROM edc_contrato c " +
                "INNER JOIN bas_pessoa p ON p.id = c.id_pessoa " +
                "INNER JOIN bas_pessoa_unidade p_u_jt ON p_u_jt.id_pessoa = p.id " +
                "INNER JOIN bas_unidade u ON u.id = p_u_jt.id_unidade " +
                "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                "WHERE u.id IN :unidadesIds " +
                "AND (lower(COALESCE(pf.nome, '')) LIKE '%' || :query || '%' " +
                "OR lower(COALESCE(pj.nome_fantasia, '')) LIKE '%' || :query || '%' " +
                "OR pf.cpf LIKE '%' || :query || '%' " +
                "OR pj.cnpj LIKE '%' || :query || '%') " +
                "ORDER BY COALESCE(pf.nome, pj.nome_fantasia, '') LIMIT 20";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql, Tuple.class)
                .setParameter("unidadesIds", unidadesIds)
                .setParameter("query", query.toLowerCase())
                .getResultList())
                .map(list -> list.stream().map(row -> {
                    Tuple t = (Tuple) row;
                    return new AlunoOption(
                            TupleHelper.getLong(t, "id"),
                            TupleHelper.getString(t, "nome"),
                            TupleHelper.getString(t, "cpf"),
                            TupleHelper.getString(t, "cnpj")
                    );
                }).collect(Collectors.toList()));
    }

    public Uni<List<DocumentoAlunoItem>> carregarDocumentosAluno(Long pessoaId) {
        String sql = "SELECT da.id AS id, da.nome_documento AS nome_documento, da.data AS data, da.local AS local, u.login AS login " +
                "FROM edc_documento_aluno da " +
                "LEFT JOIN bas_usuario u ON u.id = da.id_usuario " +
                "WHERE da.id_pessoa = ?1 " +
                "ORDER BY da.data DESC";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql, Tuple.class)
                .setParameter(1, pessoaId)
                .getResultList()
                .map(list -> list.stream().map(row -> {
                    Tuple t = (Tuple) row;
                    return new DocumentoAlunoItem(
                            TupleHelper.getLong(t, "id"),
                            TupleHelper.getString(t, "nome_documento"),
                            TupleHelper.getDate(t, "data"),
                            TupleHelper.getString(t, "local"),
                            TupleHelper.getString(t, "login")
                    );
                }).collect(Collectors.toList())));
    }

    public Uni<Void> salvarDocumentoAluno(Long pessoaId, String nomeDocumento, String arquivoBase64, Long usuarioId) {
        String sql = "INSERT INTO edc_documento_aluno (id_pessoa, nome_documento, data, local, id_usuario) " +
                "VALUES (?1, ?2, CURRENT_TIMESTAMP, ?3, ?4)";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter(1, pessoaId)
                .setParameter(2, nomeDocumento)
                .setParameter(3, arquivoBase64)
                .setParameter(4, usuarioId)
                .executeUpdate())
                .replaceWithVoid();
    }

    public Uni<Void> inserirArquivo(Long contratoId, String arquivoBase64, Long usuarioId) {
        String sql = "UPDATE edc_contrato SET local = ?1, fl_pdf = ?2, id_usuario = ?3 WHERE id = ?4";
        boolean isPdf = arquivoBase64 != null && arquivoBase64.startsWith("data:application/pdf");
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter(1, "contrato_" + contratoId + (isPdf ? ".pdf" : ".png"))
                .setParameter(2, isPdf)
                .setParameter(3, usuarioId)
                .setParameter(4, contratoId)
                .executeUpdate())
                .replaceWithVoid();
    }

    public Uni<Void> inserirChamada(Long digitalizacaoChamadaId, String arquivoBase64, Long usuarioId) {
        String sql = "UPDATE edc_digitalizacao_chamada SET local = ?1, fl_pdf = ?2, id_usuario = ?3, data_inseriu_arquivo = CURRENT_TIMESTAMP WHERE id = ?4";
        boolean isPdf = arquivoBase64 != null && arquivoBase64.startsWith("data:application/pdf");
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter(1, "chamada_" + digitalizacaoChamadaId + (isPdf ? ".pdf" : ".png"))
                .setParameter(2, isPdf)
                .setParameter(3, usuarioId)
                .setParameter(4, digitalizacaoChamadaId)
                .executeUpdate())
                .replaceWithVoid();
    }

    public Uni<Void> salvarChamada(Long digitalizacaoChamadaId, Long usuarioId) {
        String sql = "UPDATE edc_digitalizacao_chamada SET id_usuario = ?1, data = CURRENT_TIMESTAMP WHERE id = ?2";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter(1, usuarioId)
                .setParameter(2, digitalizacaoChamadaId)
                .executeUpdate())
                .replaceWithVoid();
    }

    // Response DTOs
    public record TurmaOption(long id, int sequencia, String componente, String unidade, String curso, Date dataInicio, Date dataFim) {}
    public record OcorrenciaItem(long id, Date data, long diaAulaId) {}
    public record ChamadaItem(long id, String local, boolean pdf, long chamadaAssinadaImpressaId, int sequencia, Date inicio, Date fim, boolean ativo) {}
    public record MatriculaItem(long id, long pessoaId, String alunoNome) {}
    public record CarregarDiasAulaResponse(List<OcorrenciaItem> ocorrencias, List<ChamadaItem> chamadas, List<MatriculaItem> matriculas) {}
    public record OcorrenciaGridItem(long id, Date data) {}
    public record CadernoItem(long id, long matriculaId, long ocorrenciaId, String presenca) {}
    public record CarregarOcorrenciaResponse(List<OcorrenciaGridItem> ocorrencias, List<CadernoItem> cadernos) {}
    public record AlunoOption(long id, String nome, String cpf, String cnpj) {}
    public record DocumentoAlunoItem(long id, String nomeDocumento, Date data, String local, String usuarioLogin) {}
}