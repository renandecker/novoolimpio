package br.com.sol7.olimpio.comercial.estrategia;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class EstrategiaRepository implements PanacheRepository<Estrategia> {

    // Migrado de EstrategiaRepository.autocomplete (legado) - HQL original:
    // select e from Estrategia e where lower(e.descricao) like '%' || ?1 || '%' OR str(e.id) = ?1 order by e.descricao
    public static final String SQL_AUTOCOMPLETE =
            "SELECT e.* FROM com_estrategia e WHERE lower(e.descricao) like '%' || ?1 || '%' OR CAST(e.id AS text) = ?1 ORDER BY e.descricao";

    public Uni<java.util.List<Estrategia>> autocomplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTOCOMPLETE, Estrategia.class)
                    .setParameter(1, query)
                    .getResultList());
    }

}