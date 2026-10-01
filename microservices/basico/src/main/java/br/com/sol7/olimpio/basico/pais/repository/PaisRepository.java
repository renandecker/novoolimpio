package br.com.sol7.olimpio.basico.pais.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.pais.entity.Pais;

@ApplicationScoped
public class PaisRepository implements PanacheRepository<Pais> {

    // select p from Pais p where lower(p.nome) like '%' || ?1 || '%' OR str(p.id) = ?1  order by p.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT p.* FROM bas_pais p WHERE lower(p.nome) like '%' || ?1 || '%' OR CAST(p.id AS text) = ?1 ORDER BY p.nome";

    public Uni<java.util.List<Pais>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Pais.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}