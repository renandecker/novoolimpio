package br.com.sol7.olimpio.basico.etnia.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.etnia.entity.Etnia;

@ApplicationScoped
public class EtniaRepository implements PanacheRepository<Etnia> {

    // Migrado de EtniaRepository.buscaTodosOrdenado (legado) - HQL original:
    // select u from Etnia u order by u.descricao
    public static final String SQL_BUSCA_TODOS_ORDENADO =
            "SELECT u.* FROM bas_etnia u ORDER BY u.descricao";

    public Uni<java.util.List<Etnia>> buscaTodosOrdenado() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCA_TODOS_ORDENADO, Etnia.class)

                        .getResultList());
    }

}