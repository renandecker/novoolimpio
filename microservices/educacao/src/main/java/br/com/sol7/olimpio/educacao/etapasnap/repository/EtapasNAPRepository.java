package br.com.sol7.olimpio.educacao.etapasnap;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class EtapasNAPRepository implements PanacheRepository<EtapasNAP> {

    // select e from EtapasNAP e where lower(e.descricao) like '%' || ?1 || '%' OR str(e.id) = ?1 order by e.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT e.* FROM edc_etapas_nap e WHERE lower(e.descricao) like '%' || ?1 || '%' OR CAST(e.id AS text) = ?1 ORDER BY e.descricao";

    public Uni<java.util.List<EtapasNAP>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, EtapasNAP.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select distinct e from EtapasNAP e left join e.usuarios u left join e.perfils p  where ((u = ?1 and e.usuario = false) or  e.usuario = true) or ((p in (?2) and e.perfil = false) or e.perfil = true) order by e.ordem
    public static final String SQL_LISTAR_ETAPAS_ORDEM_COM_USUARIO =
            "SELECT DISTINCT e.* FROM edc_etapas_nap e LEFT JOIN edc_etapas_nap_regras_usuario e_u_jt ON e_u_jt.id_etapas = e.id LEFT JOIN bas_usuario u ON u.id = e_u_jt.id_usuario LEFT JOIN edc_nap_etapas_perfil e_p_jt ON e_p_jt.id_etapas = e.id LEFT JOIN bas_perfil p ON p.id = e_p_jt.id_perfil WHERE ((u.id = ?1 and e.fl_usuario = false) or e.fl_usuario = true) or ((p in (?2) and e.fl_perfil = false) or e.fl_perfil = true) ORDER BY e.ordem";

    public Uni<java.util.List<EtapasNAP>> listarEtapasOrdemComUsuario(Long usuarioId, List<Long> perfilsIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_ETAPAS_ORDEM_COM_USUARIO, EtapasNAP.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, perfilsIds)
                        .getResultList());
    }


    // select u from EtapasNAP e inner join e.usuarios u where (e = ?1 and e.usuario = false ) or  e.usuario = true order by e.ordem
    public static final String SQL_LISTAR_USUARIOS_DA_ETAPA =
            "SELECT u.* FROM edc_etapas_nap e INNER JOIN edc_etapas_nap_regras_usuario e_u_jt ON e_u_jt.id_etapas = e.id INNER JOIN bas_usuario u ON u.id = e_u_jt.id_usuario WHERE (e.id = ?1 and e.fl_usuario = false ) or e.fl_usuario = true ORDER BY e.ordem";

    // Atencao: a query original seleciona 'Usuario', nao 'EtapasNAP'.
    // Se 'Usuario' existir como entidade neste microsservico, troque Object por Usuario.class abaixo.
    public Uni<java.util.List<Object>> listarUsuariosDaEtapa(Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_USUARIOS_DA_ETAPA)
                        .setParameter(1, etapasNAPId)
                        .getResultList());
    }


    // select u from EtapasNAP e inner join e.perfils u where (e = ?1 and e.perfil = false ) or  e.perfil = true order by e.ordem
    public static final String SQL_LISTAR_PERFIL_DA_ETAPA =
            "SELECT u.* FROM edc_etapas_nap e INNER JOIN edc_nap_etapas_perfil e_u_jt ON e_u_jt.id_etapas = e.id INNER JOIN bas_perfil u ON u.id = e_u_jt.id_perfil WHERE (e.id = ?1 and e.fl_perfil = false ) or e.fl_perfil = true ORDER BY e.ordem";

    // Atencao: a query original seleciona 'Perfil', nao 'EtapasNAP'.
    // Se 'Perfil' existir como entidade neste microsservico, troque Object por Perfil.class abaixo.
    public Uni<java.util.List<Object>> listarPerfilDaEtapa(Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PERFIL_DA_ETAPA)
                        .setParameter(1, etapasNAPId)
                        .getResultList());
    }


    // select e from EtapasNAP e left join fetch e.usuarios u where ((u = ?1 and e.usuario = false ) or  e.usuario = true) and e.customizado = false order by e.ordem
    public static final String SQL_LISTAR_ETAPAS_TROCA_ORDEM_COM_USUARIO =
            "SELECT e.* FROM edc_etapas_nap e LEFT JOIN edc_etapas_nap_regras_usuario e_u_jt ON e_u_jt.id_etapas = e.id LEFT JOIN bas_usuario u ON u.id = e_u_jt.id_usuario WHERE ((u.id = ?1 and e.fl_usuario = false ) or e.fl_usuario = true) and e.fl_customizado = false ORDER BY e.ordem";

    public Uni<java.util.List<EtapasNAP>> listarEtapasTrocaOrdemComUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_ETAPAS_TROCA_ORDEM_COM_USUARIO, EtapasNAP.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // select distinct e from EtapasNAP e order by e.ordem
    public static final String SQL_LISTAR_ETAPAS_ORDEM =
            "SELECT DISTINCT e.* FROM edc_etapas_nap e ORDER BY e.ordem";

    public Uni<java.util.List<EtapasNAP>> listarEtapasOrdem() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_ETAPAS_ORDEM, EtapasNAP.class)

                        .getResultList());
    }

}