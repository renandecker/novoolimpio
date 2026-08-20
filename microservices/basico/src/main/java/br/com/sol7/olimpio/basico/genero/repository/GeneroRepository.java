package br.com.sol7.olimpio.basico.genero.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.genero.entity.Genero;

@ApplicationScoped
public class GeneroRepository implements PanacheRepository<Genero> {

    // Migrado de GeneroRepository.buscaTodosOrdenado (legado) - HQL original:
    // select u from Genero u order by u.id
    public static final String SQL_BUSCA_TODOS_ORDENADO =
            "SELECT u.* FROM bas_genero u ORDER BY u.id";

    public Uni<java.util.List<Genero>> buscaTodosOrdenado() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_TODOS_ORDENADO, Genero.class)

                        .getResultList());
    }

}