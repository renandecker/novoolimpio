package br.com.sol7.olimpio.basico.escolaridade.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.escolaridade.entity.Escolaridade;

@ApplicationScoped
public class EscolaridadeRepository implements PanacheRepository<Escolaridade> {

    // Migrado de EscolaridadeRepository.findAll (legado) - HQL original:
    // Select a from Escolaridade a order by a.descricao
    public static final String SQL_FIND_ALL =
            "SELECT a.* FROM bas_escolaridade a ORDER BY a.descricao";

    public Uni<java.util.List<Escolaridade>> findAllEscolaridade() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_ALL, Escolaridade.class)

                        .getResultList());
    }


    // Migrado de EscolaridadeRepository.findAllOrdem (legado) - HQL original:
    // Select a from Escolaridade a order by a.ordem
    public static final String SQL_FIND_ALL_ORDEM =
            "SELECT a.* FROM bas_escolaridade a ORDER BY a.ordem";

    public Uni<java.util.List<Escolaridade>> findAllOrdem() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_ALL_ORDEM, Escolaridade.class)

                        .getResultList());
    }


    // Migrado de EscolaridadeRepository.findAllOrdemInvertido (legado) - HQL original:
    // Select a from Escolaridade a order by a.ordem desc
    public static final String SQL_FIND_ALL_ORDEM_INVERTIDO =
            "SELECT a.* FROM bas_escolaridade a ORDER BY a.ordem desc";

    public Uni<java.util.List<Escolaridade>> findAllOrdemInvertido() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FIND_ALL_ORDEM_INVERTIDO, Escolaridade.class)

                        .getResultList());
    }


    // Migrado de EscolaridadeRepository.autoComplete (legado) - HQL original:
    // select c from Escolaridade c where  lower(c.descricao) like '%' || lower(?1) || '%'  OR  str(c.id) = ?1 order by c.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT c.* FROM bas_escolaridade c WHERE lower(c.descricao) like '%' || lower(?1) || '%' OR CAST(c.id AS text) = ?1 ORDER BY c.descricao LIMIT 10";

    public Uni<java.util.List<Escolaridade>> autoComplete(String lowerCase) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Escolaridade.class)
                        .setParameter(1, lowerCase)
                        .getResultList());
    }

}