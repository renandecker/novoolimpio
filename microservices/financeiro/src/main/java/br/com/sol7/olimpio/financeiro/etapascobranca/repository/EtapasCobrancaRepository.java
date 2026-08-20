package br.com.sol7.olimpio.financeiro.etapascobranca;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class EtapasCobrancaRepository implements PanacheRepository<EtapasCobranca> {

    // Migrado de EtapasCobrancaRepository.listarEtapasOrdemComUsuario (legado) - HQL original:
    // select distinct e from EtapasCobranca e left join e.usuarios u left join e.perfils p  where ((u = ?1 and e.usuario = false) or  e.usuario = true) or ((p in (?2) and e.perfil = false) or  e.perfil = true) order by e.ordem
    public static final String SQL_LISTAR_ETAPAS_ORDEM_COM_USUARIO =
            "SELECT DISTINCT e.* FROM fin_etapas_cobranca e LEFT JOIN fin_etapas_cobranca_regras_usuario e_u_jt ON e_u_jt.id_etapas = e.id LEFT JOIN bas_usuario u ON u.id = e_u_jt.id_usuario LEFT JOIN edc_cobranca_etapas_perfil e_p_jt ON e_p_jt.id_etapas = e.id LEFT JOIN bas_perfil p ON p.id = e_p_jt.id_perfil WHERE ((u.id = ?1 and e.fl_usuario = false) or e.fl_usuario = true) or ((p in (?2) and e.fl_perfil = false) or e.fl_perfil = true) ORDER BY e.ordem";

    public Uni<java.util.List<EtapasCobranca>> listarEtapasOrdemComUsuario(Long usuarioId, List<Long> perfilsIds) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_ETAPAS_ORDEM_COM_USUARIO, EtapasCobranca.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, perfilsIds)
                        .getResultList());
    }


    // Migrado de EtapasCobrancaRepository.listarEtapasTrocaOrdemComUsuario (legado) - HQL original:
    // select e from EtapasCobranca e left join fetch e.usuarios u where ((u = ?1 and e.usuario = false ) or  e.usuario = true) and e.customizado = false order by e.ordem
    public static final String SQL_LISTAR_ETAPAS_TROCA_ORDEM_COM_USUARIO =
            "SELECT e.* FROM fin_etapas_cobranca e LEFT JOIN fin_etapas_cobranca_regras_usuario e_u_jt ON e_u_jt.id_etapas = e.id LEFT JOIN bas_usuario u ON u.id = e_u_jt.id_usuario WHERE ((u.id = ?1 and e.fl_usuario = false ) or e.fl_usuario = true) and e.fl_customizado = false ORDER BY e.ordem";

    public Uni<java.util.List<EtapasCobranca>> listarEtapasTrocaOrdemComUsuario(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_ETAPAS_TROCA_ORDEM_COM_USUARIO, EtapasCobranca.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // Migrado de EtapasCobrancaRepository.listarUsuariosDaEtapa (legado) - HQL original:
    // select u from EtapasCobranca e inner join e.usuarios u where (e = ?1 and e.usuario = false ) or  e.usuario = true order by e.ordem
    public static final String SQL_LISTAR_USUARIOS_DA_ETAPA =
            "SELECT u.* FROM fin_etapas_cobranca e INNER JOIN fin_etapas_cobranca_regras_usuario e_u_jt ON e_u_jt.id_etapas = e.id INNER JOIN bas_usuario u ON u.id = e_u_jt.id_usuario WHERE (e.id = ?1 and e.fl_usuario = false ) or e.fl_usuario = true ORDER BY e.ordem";

    // Atencao: a query original seleciona 'Usuario', nao 'EtapasCobranca'.
    // Se 'Usuario' existir como entidade neste microsservico, troque Object por Usuario.class abaixo.
    public Uni<java.util.List<Object>> listarUsuariosDaEtapa(Long etapasCobrancaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_USUARIOS_DA_ETAPA)
                        .setParameter(1, etapasCobrancaId)
                        .getResultList());
    }


    // Migrado de EtapasCobrancaRepository.listarPerfilDaEtapa (legado) - HQL original:
    // select u from EtapasCobranca e inner join e.perfils u where (e = ?1 and e.perfil = false ) or  e.perfil = true order by e.ordem
    public static final String SQL_LISTAR_PERFIL_DA_ETAPA =
            "SELECT u.* FROM fin_etapas_cobranca e INNER JOIN edc_cobranca_etapas_perfil e_u_jt ON e_u_jt.id_etapas = e.id INNER JOIN bas_perfil u ON u.id = e_u_jt.id_perfil WHERE (e.id = ?1 and e.fl_perfil = false ) or e.fl_perfil = true ORDER BY e.ordem";

    // Atencao: a query original seleciona 'Perfil', nao 'EtapasCobranca'.
    // Se 'Perfil' existir como entidade neste microsservico, troque Object por Perfil.class abaixo.
    public Uni<java.util.List<Object>> listarPerfilDaEtapa(Long etapasNAPId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_PERFIL_DA_ETAPA)
                        .setParameter(1, etapasNAPId)
                        .getResultList());
    }


    // Migrado de EtapasCobrancaRepository.autoComplete (legado) - HQL original:
    // select e from EtapasCobranca e where lower(e.descricao) like '%' || ?1 || '%' OR str(e.id) = ?1 order by e.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT e.* FROM fin_etapas_cobranca e WHERE lower(e.descricao) like '%' || ?1 || '%' OR CAST(e.id AS text) = ?1 ORDER BY e.descricao";

    public Uni<java.util.List<EtapasCobranca>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, EtapasCobranca.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de EtapasCobrancaRepository.listarEtapasOrdem (legado) - HQL original:
    // select distinct e from EtapasCobranca e order by e.ordem
    public static final String SQL_LISTAR_ETAPAS_ORDEM =
            "SELECT DISTINCT e.* FROM fin_etapas_cobranca e ORDER BY e.ordem";

    public Uni<java.util.List<EtapasCobranca>> listarEtapasOrdem() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_ETAPAS_ORDEM, EtapasCobranca.class)

                        .getResultList());
    }

}