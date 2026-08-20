package br.com.sol7.olimpio.educacao.periodo;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class PeriodoRepository implements PanacheRepository<Periodo> {

    // Migrado de PeriodoRepository.buscarPeriodoComUnidades (legado) - HQL original:
    // Select ca from Periodo ca left join fetch ca.unidades where ca = ?1
    public static final String SQL_BUSCAR_PERIODO_COM_UNIDADES =
            "SELECT ca.* FROM edc_periodo ca WHERE ca.id = ?1";

    public Uni<java.util.List<Periodo>> buscarPeriodoComUnidades(Long entityId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_PERIODO_COM_UNIDADES, Periodo.class)
                        .setParameter(1, entityId)
                        .getResultList());
    }

}