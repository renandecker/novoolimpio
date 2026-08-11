package br.com.sol7.olimpio.login.tema.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import br.com.sol7.olimpio.login.tema.entity.Tema;

@ApplicationScoped
public class TemaRepository implements PanacheRepository<Tema> {

    public static final String SQL_FIND_DEFAULT =
            "SELECT c.* FROM bas_temas c WHERE c.fl_default = true";

    public Uni<List<Tema>> findDefault() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_DEFAULT, Tema.class)
                        .getResultList());
    }

    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT u.* FROM bas_temas u WHERE (((lower(u.titulo) like '%' || ?1 || '%' OR lower(u.tema) like '%' || ?1 || '%' OR CAST(u.id AS text) = ?1) and ?1 <> '') or ?1 = '') ORDER BY u.titulo LIMIT 10";

    public Uni<List<Tema>> autoComplete(String query) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Tema.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}
