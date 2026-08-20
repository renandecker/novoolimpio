package br.com.sol7.olimpio.basico.estado.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.estado.entity.Estado;

@ApplicationScoped
public class EstadoRepository implements PanacheRepository<Estado> {

    // Migrado de EstadoRepository.autoComplete (legado) - HQL original:
    // select e from Estado e where lower(e.nome) like '%' || ?1 || '%' OR lower(str(e.uf)) like '%' || ?1 || '%'  OR str(e.id) = ?1  order by e.nome
    public static final String SQL_AUTO_COMPLETE =
            "SELECT e.* FROM bas_estado e WHERE lower(e.nome) like '%' || ?1 || '%' OR lower(CAST(e.uf AS text)) like '%' || ?1 || '%' OR CAST(e.id AS text) = ?1 ORDER BY e.nome";

    public Uni<java.util.List<Estado>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Estado.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }

}