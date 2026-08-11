package br.com.sol7.olimpio.educacao.criterio;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class CriterioRepository implements PanacheRepository<Criterio> {

    // Migrado de CriterioRepository.buscarCriterioComTurno (legado) - HQL original:
    // Select c from Criterio c left join fetch c.turnoEducacao where c.curriculo =?1 AND c.unidade = ?2
    public static final String SQL_BUSCAR_CRITERIO_COM_TURNO =
            "SELECT c.* FROM edc_criterio c WHERE c.id_curriculo =?1 AND c.id_unidade = ?2";

    public Uni<java.util.List<Criterio>> buscarCriterioComTurno(Long curriculoId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CRITERIO_COM_TURNO, Criterio.class)
                    .setParameter(1, curriculoId)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }


    // Migrado de CriterioRepository.buscarCriterioComDiasSemana (legado) - HQL original:
    // Select c from Criterio c left join fetch c.diaSemana where c.curriculo =?1 AND c.unidade = ?2
    public static final String SQL_BUSCAR_CRITERIO_COM_DIAS_SEMANA =
            "SELECT c.* FROM edc_criterio c WHERE c.id_curriculo =?1 AND c.id_unidade = ?2";

    public Uni<java.util.List<Criterio>> buscarCriterioComDiasSemana(Long curriculoId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CRITERIO_COM_DIAS_SEMANA, Criterio.class)
                    .setParameter(1, curriculoId)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }


    // Migrado de CriterioRepository.buscarCriterio (legado) - HQL original:
    // Select c from Criterio c where c.curriculo =?1 AND c.unidade = ?2 order by c.id desc
    public static final String SQL_BUSCAR_CRITERIO =
            "SELECT c.* FROM edc_criterio c WHERE c.id_curriculo =?1 AND c.id_unidade = ?2 ORDER BY c.id desc";

    public Uni<java.util.List<Criterio>> buscarCriterio(Long curriculoId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CRITERIO, Criterio.class)
                    .setParameter(1, curriculoId)
                    .setParameter(2, unidadeId)
                    .getResultList());
    }

}