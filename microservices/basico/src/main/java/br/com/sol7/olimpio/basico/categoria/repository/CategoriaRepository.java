package br.com.sol7.olimpio.basico.categoria.repository;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.categoria.entity.Categoria;
@ApplicationScoped public class CategoriaRepository implements PanacheRepository<Categoria> {

    // Migrado de CategoriaLivrosRepository.autoComplete (legado) - HQL original:
    // select u from Categoria u where (lower(u.descricaocompleta) like '%' || ?1 || '%' or str(u.id) = ?1) order by u.descricaocompleta
    public static final String SQL_AUTO_COMPLETE =
            "SELECT u.* FROM bas_categoria u WHERE (lower(u.descricaocompleta) like '%' || ?1 || '%' or CAST(u.id AS text) = ?1) ORDER BY u.descricaocompleta LIMIT 10";

    public Uni<java.util.List<Categoria>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Categoria.class)
                    .setParameter(1, query)
                    .getResultList());
    }

}