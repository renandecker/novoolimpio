package br.com.sol7.olimpio.educacao.cronogramacomponentecurricular;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CronogramaComponenteCurricularRepository implements PanacheRepository<CronogramaComponenteCurricular> {

    // Migrado de CronogramaComponenteCurricularRepository.buscarCronogramaComComponente (legado) - HQL original:
    // select m from CronogramaComponenteCurricular m where m.componenteCurricular = ?1 order by m.ordem
    public static final String SQL_BUSCAR_CRONOGRAMA_COM_COMPONENTE =
            "SELECT m.* FROM edc_cronograma_componente_curricular m WHERE m.id_componente_curricular = ?1 ORDER BY m.ordem";

    public Uni<java.util.List<CronogramaComponenteCurricular>> buscarCronogramaComComponente(Long componenteCurricularId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CRONOGRAMA_COM_COMPONENTE, CronogramaComponenteCurricular.class)
                        .setParameter(1, componenteCurricularId)
                        .getResultList());
    }

}