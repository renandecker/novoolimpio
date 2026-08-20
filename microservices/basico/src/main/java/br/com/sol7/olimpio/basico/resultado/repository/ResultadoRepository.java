package br.com.sol7.olimpio.basico.resultado.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.resultado.entity.Resultado;

@ApplicationScoped
public class ResultadoRepository implements PanacheRepository<Resultado> {

    // Migrado de ResultadoRepository.autoComplete (legado) - HQL original:
    // select r from Resultado r where lower(r.descricao) like '%' || ?1 || '%' OR str(r.id) = ?1 order by r.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT r.* FROM bas_resultado r WHERE lower(r.descricao) like '%' || ?1 || '%' OR CAST(r.id AS text) = ?1 ORDER BY r.descricao";

    public Uni<java.util.List<Resultado>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Resultado.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}