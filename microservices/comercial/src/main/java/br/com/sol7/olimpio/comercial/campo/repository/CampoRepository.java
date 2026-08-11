package br.com.sol7.olimpio.comercial.campo;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class CampoRepository implements PanacheRepository<Campo> {

    // Migrado de CampoRepository.autoComplete (legado) - HQL original:
    // select c from Campo c where lower(c.rotulo) like '%' || ?1 || '%' OR lower(c.nome) like '%' || ?1 || '%'  OR str(c.id) = ?1 order by c.rotulo
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM com_campo c WHERE lower(c.rotulo) like '%' || ?1 || '%' OR lower(c.nome) like '%' || ?1 || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.rotulo LIMIT 10";

    public Uni<java.util.List<Campo>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Campo.class)
                    .setParameter(1, query)
                    .getResultList());
    }


    // Migrado de CampoRepository.buscaDezPrimeiros (legado) - HQL original:
    // select c from Campo c  order by c.rotulo
    public static final String SQL_BUSCA_DEZ_PRIMEIROS =
            "SELECT c.* FROM com_campo c ORDER BY c.rotulo LIMIT 10";

    public Uni<java.util.List<Campo>> buscaDezPrimeiros() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_DEZ_PRIMEIROS, Campo.class)

                    .getResultList());
    }

}