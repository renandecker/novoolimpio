package br.com.sol7.olimpio.comercial.indicador;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class IndicadorRepository implements PanacheRepository<Indicador> {

    // Migrado de IndicadorRepository.indicadorOrder (legado) - HQL original:
    // select i from Indicador i order by i.nome asc
    public static final String SQL_INDICADOR_ORDER =
            "SELECT i.* FROM com_indicador i ORDER BY i.nome asc";

    public Uni<java.util.List<Indicador>> indicadorOrder() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_INDICADOR_ORDER, Indicador.class)

                        .getResultList());
    }


    // Migrado de IndicadorRepository.getAllOrder (legado) - HQL original:
    // select i from Indicador i order by i.nome asc
    public static final String SQL_GET_ALL_ORDER =
            "SELECT i.* FROM com_indicador i ORDER BY i.nome asc";

    public Uni<java.util.List<Indicador>> getAllOrder() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_GET_ALL_ORDER, Indicador.class)

                        .getResultList());
    }


    // Migrado de IndicadorRepository.autoComplete (legado) - HQL original:
    // select m from Indicador m where lower(m.nome) like '%' || ?1 || '%'  OR str(m.id) = ?1
    public static final String SQL_AUTO_COMPLETE =
            "SELECT m.* FROM com_indicador m WHERE lower(m.nome) like '%' || ?1 || '%' OR CAST(m.id AS text) = ?1";

    public Uni<java.util.List<Indicador>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Indicador.class)
                        .setParameter(1, query)
                        .getResultList());
    }

}