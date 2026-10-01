package br.com.sol7.olimpio.educacao.referenciabibliografica;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ReferenciaBibliograficaRepository implements PanacheRepository<ReferenciaBibliografica> {

    // select r from ReferenciaBibliografica r where lower(r.autor) like '%' || ?1 || '%' OR lower(r.titulo) like '%' || ?1 || '%' OR str(r.id) = ?1 order by r.autor
    public static final String SQL_AUTO_COMPLETE =
            "SELECT r.* FROM edc_referencia_bibliografica r WHERE lower(r.autor) like '%' || ?1 || '%' OR lower(r.titulo) like '%' || ?1 || '%' OR CAST(r.id AS text) = ?1 ORDER BY r.autor";

    public Uni<java.util.List<ReferenciaBibliografica>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, ReferenciaBibliografica.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}