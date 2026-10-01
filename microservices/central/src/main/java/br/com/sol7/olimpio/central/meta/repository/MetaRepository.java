package br.com.sol7.olimpio.central.meta;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.Date;

@ApplicationScoped
public class MetaRepository implements PanacheRepository<Meta> {

    // Select m from Meta m where m.data = date(?1) and m.operador = ?2 order by m.id desc
    public static final String SQL_BUSCAR_META_OPERADOR_DIA =
            "SELECT m.* FROM cen_meta m WHERE m.data = date(?1) and m.id_operador = ?2 ORDER BY m.id desc LIMIT 10";

    public Uni<java.util.List<Meta>> buscarMetaOperadorDia(Date data, Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_META_OPERADOR_DIA, Meta.class)
                        .setParameter(1, data)
                        .setParameter(2, operadorId)
                        .getResultList());
    }


    // Select m from Meta m where date(?1) BETWEEN m.dataInicial AND m.dataFinal and m.operador = ?2 order by  m.id  desc
    public static final String SQL_BUSCAR_META_OPERADOR_PERIODO =
            "SELECT m.* FROM cen_meta m WHERE date(?1) BETWEEN m.data_inicial AND m.data_final and m.id_operador = ?2 ORDER BY m.id desc LIMIT 10";

    public Uni<java.util.List<Meta>> buscarMetaOperadorPeriodo(Date data, Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_META_OPERADOR_PERIODO, Meta.class)
                        .setParameter(1, data)
                        .setParameter(2, operadorId)
                        .getResultList());
    }


    // SELECT m from Meta m where m.operacional=?3 AND (m.dataInicial BETWEEN ?1 AND ?2 or m.dataFinal BETWEEN ?1 AND ?2)
    public static final String SQL_BUSCAR_CONFLITO_DATAS_COM_EQUIPE =
            "SELECT m.* FROM cen_meta m WHERE m.id_operacional=?3 AND (m.data_inicial BETWEEN ?1 AND ?2 or m.data_final BETWEEN ?1 AND ?2)";

    public Uni<java.util.List<Meta>> buscarConflitoDatasComEquipe(Date dataInicial, Date dataFinal, Long operacionalId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFLITO_DATAS_COM_EQUIPE, Meta.class)
                        .setParameter(1, dataInicial)
                        .setParameter(2, dataFinal)
                        .setParameter(3, operacionalId)
                        .getResultList());
    }


    // SELECT m from Meta m where m.operacional=?3 AND (m.dataInicial BETWEEN ?1 AND ?2 or m.dataFinal BETWEEN ?1 AND ?2) and m.id <> ?4
    public static final String SQL_BUSCAR_CONFLITO_DATAS_COM_EQUIPE_COM_META =
            "SELECT m.* FROM cen_meta m WHERE m.id_operacional=?3 AND (m.data_inicial BETWEEN ?1 AND ?2 or m.data_final BETWEEN ?1 AND ?2) and m.id <> ?4";

    public Uni<java.util.List<Meta>> buscarConflitoDatasComEquipeComMeta(Date dataInicial, Date dataFinal, Long operacionalId, int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFLITO_DATAS_COM_EQUIPE_COM_META, Meta.class)
                        .setParameter(1, dataInicial)
                        .setParameter(2, dataFinal)
                        .setParameter(3, operacionalId)
                        .setParameter(4, id)
                        .getResultList());
    }


    // SELECT m from Meta m where m.operador=?3 AND (m.dataInicial BETWEEN ?1 AND ?2 or m.dataFinal BETWEEN ?1 AND ?2)
    public static final String SQL_BUSCAR_CONFLITO_DATAS_COM_OPERADOR =
            "SELECT m.* FROM cen_meta m WHERE m.id_operador=?3 AND (m.data_inicial BETWEEN ?1 AND ?2 or m.data_final BETWEEN ?1 AND ?2)";

    public Uni<java.util.List<Meta>> buscarConflitoDatasComOperador(Date dataInicial, Date dataFinal, Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFLITO_DATAS_COM_OPERADOR, Meta.class)
                        .setParameter(1, dataInicial)
                        .setParameter(2, dataFinal)
                        .setParameter(3, operadorId)
                        .getResultList());
    }


    // SELECT m from Meta m where m.operador=?3 AND (m.dataInicial BETWEEN ?1 AND ?2 or m.dataFinal BETWEEN ?1 AND ?2) and m.id <> ?4
    public static final String SQL_BUSCAR_CONFLITO_DATAS_COM_OPERADOR_COM_META =
            "SELECT m.* FROM cen_meta m WHERE m.id_operador=?3 AND (m.data_inicial BETWEEN ?1 AND ?2 or m.data_final BETWEEN ?1 AND ?2) and m.id <> ?4";

    public Uni<java.util.List<Meta>> buscarConflitoDatasComOperadorComMeta(Date dataInicial, Date dataFinal, Long operadorId, int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CONFLITO_DATAS_COM_OPERADOR_COM_META, Meta.class)
                        .setParameter(1, dataInicial)
                        .setParameter(2, dataFinal)
                        .setParameter(3, operadorId)
                        .setParameter(4, id)
                        .getResultList());
    }


    // Select m from Meta m where  (m.data = date(?1) and m.operador = ?2 and m.operacional is null) or  (date(?1) BETWEEN m.dataInicial AND m.dataFinal and m.operador = ?2 and m.operacional is null) or (m.data = date(?1) and m.operacional = ?2 and m.operador is null) or  (date(?1) BETWEEN m.dataInicial AND m.dataFinal and m.operacional = ?2 and m.operador is null) order by m.id desc
    public static final String SQL_BUSCAR_META_OPERADOR =
            "SELECT m.* FROM cen_meta m WHERE (m.data = date(?1) and m.id_operador = ?2 and m.id_operacional is null) or (date(?1) BETWEEN m.data_inicial AND m.data_final and m.id_operador = ?2 and m.id_operacional is null) or (m.data = date(?1) and m.id_operacional = ?2 and m.id_operador is null) or (date(?1) BETWEEN m.data_inicial AND m.data_final and m.id_operacional = ?2 and m.id_operador is null) ORDER BY m.id desc LIMIT 10";

    public Uni<java.util.List<Meta>> buscarMetaOperador(Date data, Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_META_OPERADOR, Meta.class)
                        .setParameter(1, data)
                        .setParameter(2, operadorId)
                        .getResultList());
    }

}