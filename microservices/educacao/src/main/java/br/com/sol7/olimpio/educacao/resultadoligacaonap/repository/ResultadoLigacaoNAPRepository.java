package br.com.sol7.olimpio.educacao.resultadoligacaonap;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ResultadoLigacaoNAPRepository implements PanacheRepository<ResultadoLigacaoNAP> {

    // select r from ResultadoLigacaoNAP r left join fetch r.etapasNAPs where r = ?1
    public static final String SQL_BUSCAR_RESULTADO_LIGACAO_N_A_P_COM_ETAPAS =
            "SELECT r.* FROM edc_resultado_ligacao_nap r WHERE r.id = ?1";

    public Uni<java.util.List<ResultadoLigacaoNAP>> buscarResultadoLigacaoNAPComEtapas(Long resultadoLigacaoNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_RESULTADO_LIGACAO_N_A_P_COM_ETAPAS, ResultadoLigacaoNAP.class)
                        .setParameter(1, resultadoLigacaoNAPId)
                        .getResultList());
    }


    // select distinct (r) from ResultadoLigacaoNAP r left join fetch r.etapasNAPs e where e = ?1
    public static final String SQL_LISTAR_RESULTADO_LIGACAO_N_A_P =
            "SELECT DISTINCT (r) FROM edc_resultado_ligacao_nap r LEFT JOIN edc_resultado_ligacao_etapas_nap r_e_jt ON r_e_jt.id_resultado_ligacao_nap = r.id LEFT JOIN edc_etapas_nap e ON e.id = r_e_jt.id_etapas_nap WHERE e.id = ?1";

    public Uni<java.util.List<Object>> listarResultadoLigacaoNAP(Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_RESULTADO_LIGACAO_N_A_P)
                        .setParameter(1, etapasNAPId)
                        .getResultList());
    }


    // select distinct r from ResultadoLigacaoNAP r inner join r.etapasNAPs e where e = ?1 order by r.ordem, r.descricao
    public static final String SQL_LISTAR_RESULTADO_LIGACAO_COBRANCA_LIMITE =
            "SELECT DISTINCT r.* FROM edc_resultado_ligacao_nap r INNER JOIN edc_resultado_ligacao_etapas_nap r_e_jt ON r_e_jt.id_resultado_ligacao_nap = r.id INNER JOIN edc_etapas_nap e ON e.id = r_e_jt.id_etapas_nap WHERE e.id = ?1 ORDER BY r.ordem, r.descricao LIMIT 10";

    public Uni<java.util.List<ResultadoLigacaoNAP>> listarResultadoLigacaoCobrancaLimite(Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_RESULTADO_LIGACAO_COBRANCA_LIMITE, ResultadoLigacaoNAP.class)
                        .setParameter(1, etapasCobrancaId)
                        .getResultList());
    }


    // select distinct u from ResultadoLigacaoNAP u inner join u.etapasNAPs un  where un = ?2 and lower(u.descricao) like '%' || ?1 || '%' or str(u.id) like '%' || ?1 || '%' order by u.ordem, u.descricao
    public static final String SQL_AUTO_COMPLETE_COM_ETAPA =
            "SELECT DISTINCT u.* FROM edc_resultado_ligacao_nap u INNER JOIN edc_resultado_ligacao_etapas_nap u_un_jt ON u_un_jt.id_resultado_ligacao_nap = u.id INNER JOIN edc_etapas_nap un ON un.id = u_un_jt.id_etapas_nap WHERE un.id = ?2 and lower(u.descricao) like '%' || ?1 || '%' or CAST(u.id AS text) like '%' || ?1 || '%' ORDER BY u.ordem, u.descricao LIMIT 10";

    public Uni<java.util.List<ResultadoLigacaoNAP>> autoCompleteComEtapa(String query, Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_COM_ETAPA, ResultadoLigacaoNAP.class)
                        .setParameter(1, query)
                        .setParameter(2, etapasCobrancaId)
                        .getResultList());
    }


    // select distinct u from ResultadoLigacaoNAP u  where lower(u.descricao) like '%' || ?1 || '%' or str(u.id) like '%' || ?1 || '%' order by u.ordem, u.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT u.* FROM edc_resultado_ligacao_nap u WHERE lower(u.descricao) like '%' || ?1 || '%' or CAST(u.id AS text) like '%' || ?1 || '%' ORDER BY u.ordem, u.descricao LIMIT 10";

    public Uni<java.util.List<ResultadoLigacaoNAP>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, ResultadoLigacaoNAP.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}