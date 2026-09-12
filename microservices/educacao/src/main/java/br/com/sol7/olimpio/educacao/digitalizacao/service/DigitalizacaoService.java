package br.com.sol7.olimpio.educacao.digitalizacao;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.hibernate.reactive.mutiny.Mutiny;

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
        String sql = "SELECT occ.id, occ.sequencia, cc.descricao AS componente, u.sucinto AS unidade, " +
                "cur.nome AS curso, occ.data_inicio, occ.data_fim " +
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
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter("unidadesIds", unidadesIds)
                .setParameter("query", query.toLowerCase())
                .getResultList())
                .map(list -> list.stream().map(row -> {
                    Object[] arr = (Object[]) row;
                    return new TurmaOption(
                            ((Number) arr[0]).longValue(),
                            ((Number) arr[1]).intValue(),
                            (String) arr[2],
                            (String) arr[3],
                            (String) arr[4],
                            (Date) arr[5],
                            (Date) arr[6]
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
            Uni<List<OcorrenciaItem>> ocorrencias = session.createNativeQuery(sqlOcorrencias)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Object[] arr = (Object[]) row;
                        return new OcorrenciaItem(
                                ((Number) arr[0]).longValue(),
                                (Date) arr[1],
                                ((Number) arr[2]).longValue()
                        );
                    }).collect(Collectors.toList()));

            Uni<List<ChamadaItem>> chamadas = session.createNativeQuery(sqlChamadas)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Object[] arr = (Object[]) row;
                        return new ChamadaItem(
                                ((Number) arr[0]).longValue(),
                                (String) arr[1],
                                (Boolean) arr[2],
                                ((Number) arr[3]).longValue(),
                                ((Number) arr[4]).intValue(),
                                (Date) arr[5],
                                (Date) arr[6],
                                (Boolean) arr[7]
                        );
                    }).collect(Collectors.toList()));

            Uni<List<MatriculaItem>> matriculas = session.createNativeQuery(sqlMatriculas)
                    .setParameter(1, oferecimentoComponenteCurricularId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Object[] arr = (Object[]) row;
                        return new MatriculaItem(
                                ((Number) arr[0]).longValue(),
                                ((Number) arr[1]).longValue(),
                                (String) arr[2]
                        );
                    }).collect(Collectors.toList()));

            return Uni.combine().all().unis(ocorrencias, chamadas, matriculas)
                    .asTuple()
                    .map(tuple -> new CarregarDiasAulaResponse(tuple.getItem1(), tuple.getItem2(), tuple.getItem3()));
        });
    }

    public Uni<List<ChamadaItem>> digitalizacaoChamadas(Long oferecimentoComponenteCurricularId) {
        String sql = "SELECT dc.id, dc.local, dc.fl_pdf, dc.id_chamada_assinada_impressa, " +
                "cai.sequencia, cai.inicio, cai.fim, cai.ativo " +
                "FROM edc_digitalizacao_chamada dc " +
                "LEFT JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id_oferecimento_componente_curricular = ?1 " +
                "ORDER BY cai.sequencia";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter(1, oferecimentoComponenteCurricularId)
                .getResultList()
                .map(list -> list.stream().map(row -> {
                    Object[] arr = (Object[]) row;
                    return new ChamadaItem(
                            ((Number) arr[0]).longValue(),
                            (String) arr[1],
                            (Boolean) arr[2],
                            ((Number) arr[3]).longValue(),
                            ((Number) arr[4]).intValue(),
                            (Date) arr[5],
                            (Date) arr[6],
                            (Boolean) arr[7]
                    );
                }).collect(Collectors.toList())));
    }

    public Uni<CarregarOcorrenciaResponse> carregarOcorrencia(Long digitalizacaoChamadaId) {
        String sqlOcorrencias = "SELECT o.id, o.data " +
                "FROM edc_ocorrencia_componente_curricular o " +
                "JOIN edc_digitalizacao_chamada dc ON dc.id_oferecimento_componente_curricular = o.id_oferecimento_componente_curricular " +
                "JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id = ?1 " +
                "AND o.fl_ativo = true " +
                "AND o.data BETWEEN cai.inicio AND cai.fim " +
                "ORDER BY o.data";
        String sqlCadernos = "SELECT c.id, c.id_matricula, c.id_ocorrencia_componente_curricular, c.presenca " +
                "FROM edc_caderno_componente_curricular c " +
                "JOIN edc_ocorrencia_componente_curricular o ON o.id = c.id_ocorrencia_componente_curricular " +
                "JOIN edc_digitalizacao_chamada dc ON dc.id_oferecimento_componente_curricular = o.id_oferecimento_componente_curricular " +
                "JOIN edc_chamada_assinada_impressa cai ON cai.id = dc.id_chamada_assinada_impressa " +
                "WHERE dc.id = ?1 " +
                "AND o.data BETWEEN cai.inicio AND cai.fim";

        return sessionFactory.withSession(session -> {
            Uni<List<OcorrenciaGridItem>> ocorrencias = session.createNativeQuery(sqlOcorrencias)
                    .setParameter(1, digitalizacaoChamadaId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Object[] arr = (Object[]) row;
                        return new OcorrenciaGridItem(
                                ((Number) arr[0]).longValue(),
                                (Date) arr[1]
                        );
                    }).collect(Collectors.toList()));

            Uni<List<CadernoItem>> cadernos = session.createNativeQuery(sqlCadernos)
                    .setParameter(1, digitalizacaoChamadaId)
                    .getResultList()
                    .map(list -> list.stream().map(row -> {
                        Object[] arr = (Object[]) row;
                        return new CadernoItem(
                                ((Number) arr[0]).longValue(),
                                ((Number) arr[1]).longValue(),
                                ((Number) arr[2]).longValue(),
                                (String) arr[3]
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
        String sql = "SELECT DISTINCT p.id, COALESCE(pf.nome, pj.nome_fantasia, '') AS nome, pf.cpf, pj.cnpj " +
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
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter("unidadesIds", unidadesIds)
                .setParameter("query", query.toLowerCase())
                .getResultList())
                .map(list -> list.stream().map(row -> {
                    Object[] arr = (Object[]) row;
                    return new AlunoOption(
                            ((Number) arr[0]).longValue(),
                            (String) arr[1],
                            (String) arr[2],
                            (String) arr[3]
                    );
                }).collect(Collectors.toList()));
    }

    public Uni<List<DocumentoAlunoItem>> carregarDocumentosAluno(Long pessoaId) {
        String sql = "SELECT da.id, da.nome_documento, da.data, da.local, u.login " +
                "FROM edc_documento_aluno da " +
                "LEFT JOIN bas_usuario u ON u.id = da.id_usuario " +
                "WHERE da.id_pessoa = ?1 " +
                "ORDER BY da.data DESC";
        return sessionFactory.withSession(session -> session.createNativeQuery(sql)
                .setParameter(1, pessoaId)
                .getResultList()
                .map(list -> list.stream().map(row -> {
                    Object[] arr = (Object[]) row;
                    return new DocumentoAlunoItem(
                            ((Number) arr[0]).longValue(),
                            (String) arr[1],
                            (Date) arr[2],
                            (String) arr[3],
                            (String) arr[4]
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