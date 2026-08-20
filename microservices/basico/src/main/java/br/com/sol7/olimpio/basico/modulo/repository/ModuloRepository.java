package br.com.sol7.olimpio.basico.modulo.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.modulo.entity.Modulo;

@ApplicationScoped
public class ModuloRepository implements PanacheRepository<Modulo> {

    // Migrado de ModuloRepository.autoComplete (legado) - HQL original:
    // select m from Modulo m where (lower(m.rotulo) like '%' || ?1 || '%' OR lower(m.descricao) like '%' || ?1 || '%'  OR str(m.id) = ?1) AND NOT (m.outcome is null OR m.outcome = '') order by m.rotulo
    public static final String SQL_AUTO_COMPLETE =
            "SELECT m.* FROM bas_modulo m WHERE (lower(m.rotulo) like '%' || ?1 || '%' OR lower(m.descricao) like '%' || ?1 || '%' OR CAST(m.id AS text) = ?1) AND NOT (m.outcome is null OR m.outcome = '') ORDER BY m.rotulo";

    public Uni<java.util.List<Modulo>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Modulo.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de ModuloRepository.autoCompleteFavorito (legado) - HQL original:
    // select m from Modulo m inner join m.perfilModulo pm  where pm.perfil = ?1 and (lower(m.rotulo) like '%' || ?2 || '%' OR lower(m.descricao) like '%' || ?2 || '%'  OR str(m.id) = ?2) AND NOT (m.outcome is null OR m.outcome = '') order by m.rotulo
    public static final String SQL_AUTO_COMPLETE_FAVORITO =
            "SELECT m.* FROM bas_modulo m INNER JOIN bas_perfil_modulo pm ON pm.id_modulo = m.id WHERE pm.id_perfil = ?1 and (lower(m.rotulo) like '%' || ?2 || '%' OR lower(m.descricao) like '%' || ?2 || '%' OR CAST(m.id AS text) = ?2) AND NOT (m.outcome is null OR m.outcome = '') ORDER BY m.rotulo";

    public Uni<java.util.List<Modulo>> autoCompleteFavorito(Long perfilId, String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_FAVORITO, Modulo.class)
                        .setParameter(1, perfilId)
                        .setParameter(2, query)
                        .getResultList());
    }


    // Migrado de ModuloRepository.autoCompleteAntecessor (legado) - HQL original:
    // select m from Modulo m where m.outcome is null and (lower(m.rotulo) like '%' || ?1 || '%' OR lower(m.descricao) like '%' || ?1 || '%'  OR str(m.id) = ?1) order by m.rotulo
    public static final String SQL_AUTO_COMPLETE_ANTECESSOR =
            "SELECT m.* FROM bas_modulo m WHERE m.outcome is null and (lower(m.rotulo) like '%' || ?1 || '%' OR lower(m.descricao) like '%' || ?1 || '%' OR CAST(m.id AS text) = ?1) ORDER BY m.rotulo";

    public Uni<java.util.List<Modulo>> autoCompleteAntecessor(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ANTECESSOR, Modulo.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de ModuloRepository.autoCompleteAntecessorOutcome (legado) - HQL original:
    // select m from Modulo m where m.antecessor is not null and m.outcome is null and (lower(m.rotulo) like '%' || ?1 || '%' OR lower(m.descricao) like '%' || ?1 || '%'  OR str(m.id) = ?1) order by m.rotulo
    public static final String SQL_AUTO_COMPLETE_ANTECESSOR_OUTCOME =
            "SELECT m.* FROM bas_modulo m WHERE m.id_modulo is not null and m.outcome is null and (lower(m.rotulo) like '%' || ?1 || '%' OR lower(m.descricao) like '%' || ?1 || '%' OR CAST(m.id AS text) = ?1) ORDER BY m.rotulo";

    public Uni<java.util.List<Modulo>> autoCompleteAntecessorOutcome(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_ANTECESSOR_OUTCOME, Modulo.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de ModuloRepository.buscarPorRotulo (legado) - HQL original:
    // Select m from Modulo m where m.rotulo = ?1
    public static final String SQL_BUSCAR_POR_ROTULO =
            "SELECT m.* FROM bas_modulo m WHERE m.rotulo = ?1";

    public Uni<java.util.List<Modulo>> buscarPorRotulo(String rotulo) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_POR_ROTULO, Modulo.class)
                        .setParameter(1, rotulo)
                        .getResultList());
    }


    // Migrado de ModuloRepository.buscarAntecessoPorRotulo (legado) - HQL original:
    // Select m from Modulo m where m.antecessor = ?1
    public static final String SQL_BUSCAR_ANTECESSO_POR_ROTULO =
            "SELECT m.* FROM bas_modulo m WHERE m.id_modulo = ?1";

    public Uni<java.util.List<Modulo>> buscarAntecessoPorRotulo(Long moduloId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ANTECESSO_POR_ROTULO, Modulo.class)
                        .setParameter(1, moduloId)
                        .getResultList());
    }


    // Migrado de ModuloRepository.buscarPorOutcome (legado) - HQL original:
    // Select m from Modulo m where m.outcome = ?1
    public static final String SQL_BUSCAR_POR_OUTCOME =
            "SELECT m.* FROM bas_modulo m WHERE m.outcome = ?1";

    public Uni<java.util.List<Modulo>> buscarPorOutcome(String url) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_POR_OUTCOME, Modulo.class)
                        .setParameter(1, url)
                        .getResultList());
    }


    // Migrado de ModuloRepository.listarPorOrdem (legado) - HQL original:
    // Select m from Modulo m order by m.ordem, m.rotulo
    public static final String SQL_LISTAR_POR_ORDEM =
            "SELECT m.* FROM bas_modulo m ORDER BY m.ordem, m.rotulo";

    public Uni<java.util.List<Modulo>> listarPorOrdem() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_POR_ORDEM, Modulo.class)

                        .getResultList());
    }


    // Migrado de ModuloRepository.ajuda (legado) - HQL original:
    // select m.ajuda from Modulo m where m.id = ?1
    public static final String SQL_AJUDA =
            "SELECT m.ajuda FROM bas_modulo m WHERE m.id = ?1";

    public Uni<java.util.List<Object>> ajuda(int id) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AJUDA)
                        .setParameter(1, id)
                        .getResultList());
    }

}