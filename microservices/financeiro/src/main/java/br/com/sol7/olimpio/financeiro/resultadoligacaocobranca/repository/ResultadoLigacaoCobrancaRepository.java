package br.com.sol7.olimpio.financeiro.resultadoligacaocobranca;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class ResultadoLigacaoCobrancaRepository implements PanacheRepository<ResultadoLigacaoCobranca> {

    // Migrado de ResultadoLigacaoCobrancaRepository.buscarResultadoLigacaoCobrancaComEtapas (legado) - HQL original:
    // select r from ResultadoLigacaoCobranca r left join fetch r.etapasCobrancas  where r = ?1
    public static final String SQL_BUSCAR_RESULTADO_LIGACAO_COBRANCA_COM_ETAPAS =
            "SELECT r.* FROM fin_resultado_ligacao_cobranca r WHERE r.id = ?1";

    public Uni<java.util.List<ResultadoLigacaoCobranca>> buscarResultadoLigacaoCobrancaComEtapas(Long resultadoLigacaoCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_RESULTADO_LIGACAO_COBRANCA_COM_ETAPAS, ResultadoLigacaoCobranca.class)
                    .setParameter(1, resultadoLigacaoCobrancaId)
                    .getResultList());
    }


    // Migrado de ResultadoLigacaoCobrancaRepository.listarResultadoLigacaoCobrancaLimite (legado) - HQL original:
    // select distinct r from ResultadoLigacaoCobranca r inner join  r.etapasCobrancas e where e = ?1 order by r.ordem, r.descricao
    public static final String SQL_LISTAR_RESULTADO_LIGACAO_COBRANCA_LIMITE =
            "SELECT DISTINCT r.* FROM fin_resultado_ligacao_cobranca r INNER JOIN fin_resultado_ligacao_etapas_cobranca r_e_jt ON r_e_jt.id_resultado_ligacao_cobranca = r.id INNER JOIN fin_etapas_cobranca e ON e.id = r_e_jt.id_etapas_cobranca WHERE e.id = ?1 ORDER BY r.ordem, r.descricao LIMIT 10";

    public Uni<java.util.List<ResultadoLigacaoCobranca>> listarResultadoLigacaoCobrancaLimite(Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_RESULTADO_LIGACAO_COBRANCA_LIMITE, ResultadoLigacaoCobranca.class)
                    .setParameter(1, etapasCobrancaId)
                    .getResultList());
    }


    // Migrado de ResultadoLigacaoCobrancaRepository.autoCompleteComEtapa (legado) - HQL original:
    // select distinct u from ResultadoLigacaoCobranca u inner join u.etapasCobrancas un where un = ?2 and lower(u.descricao) like '%' || ?1 || '%' or str(u.id) like '%' || ?1 || '%' order by u.ordem, u.descricao
    public static final String SQL_AUTO_COMPLETE_COM_ETAPA =
            "SELECT DISTINCT u.* FROM fin_resultado_ligacao_cobranca u INNER JOIN fin_resultado_ligacao_etapas_cobranca u_un_jt ON u_un_jt.id_resultado_ligacao_cobranca = u.id INNER JOIN fin_etapas_cobranca un ON un.id = u_un_jt.id_etapas_cobranca WHERE un.id = ?2 and lower(u.descricao) like '%' || ?1 || '%' or CAST(u.id AS text) like '%' || ?1 || '%' ORDER BY u.ordem, u.descricao LIMIT 10";

    public Uni<java.util.List<ResultadoLigacaoCobranca>> autoCompleteComEtapa(String query, Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_ETAPA, ResultadoLigacaoCobranca.class)
                    .setParameter(1, query)
                    .setParameter(2, etapasCobrancaId)
                    .getResultList());
    }


    // Migrado de ResultadoLigacaoCobrancaRepository.autoComplete (legado) - HQL original:
    // select distinct u from ResultadoLigacaoCobranca u  where lower(u.descricao) like '%' || ?1 || '%' or str(u.id) like '%' || ?1 || '%' order by u.ordem, u.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT u.* FROM fin_resultado_ligacao_cobranca u WHERE lower(u.descricao) like '%' || ?1 || '%' or CAST(u.id AS text) like '%' || ?1 || '%' ORDER BY u.ordem, u.descricao LIMIT 10";

    public Uni<java.util.List<ResultadoLigacaoCobranca>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, ResultadoLigacaoCobranca.class)
                    .setParameter(1, query)
                    .getResultList());
    }

}