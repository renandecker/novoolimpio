package br.com.sol7.olimpio.educacao.turnoeducacao;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class TurnoEducacaoRepository implements PanacheRepository<TurnoEducacao> {

    // Migrado de TurnoEducacaoRepository.autoComplete (legado) - HQL original:
    // select distinct t from TurnoEducacao t  where lower(t.descricao) like '%' || ?1 || '%'  OR str(t.id) = ?1 OR lower(t.sucinto) like '%' || ?1 ||  '%' order by t.descricao
    public static final String SQL_AUTO_COMPLETE =
            "SELECT DISTINCT t.* FROM edc_turno t WHERE lower(t.descricao) like '%' || ?1 || '%' OR CAST(t.id AS text) = ?1 OR lower(t.sucinto) like '%' || ?1 || '%' ORDER BY t.descricao";

    public Uni<java.util.List<TurnoEducacao>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, TurnoEducacao.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de TurnoEducacaoRepository.listarTurnosCriterio (legado) - HQL original:
    // select t from Criterio c inner join c.turnoEducacao t where c.unidade = ?1 and c.curriculo=?2 order by t.inicio, t.descricao
    public static final String SQL_LISTAR_TURNOS_CRITERIO =
            "SELECT t.* FROM edc_criterio c INNER JOIN edc_criterio_turno c_t_jt ON c_t_jt.id_criterio = c.id INNER JOIN edc_turno t ON t.id = c_t_jt.id_turno WHERE c.id_unidade = ?1 and c.id_curriculo=?2 ORDER BY t.inicio, t.descricao";

    public Uni<java.util.List<TurnoEducacao>> listarTurnosCriterio(Long uId, Long cId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_TURNOS_CRITERIO, TurnoEducacao.class)
                        .setParameter(1, uId)
                        .setParameter(2, cId)
                        .getResultList());
    }


    // Migrado de TurnoEducacaoRepository.listarTodosTurnos (legado) - HQL original:
    // select t from TurnoEducacao t order by t.inicio, t.descricao
    public static final String SQL_LISTAR_TODOS_TURNOS =
            "SELECT t.* FROM edc_turno t ORDER BY t.inicio, t.descricao";

    public Uni<java.util.List<TurnoEducacao>> listarTodosTurnos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_TODOS_TURNOS, TurnoEducacao.class)

                        .getResultList());
    }


    // Migrado de TurnoEducacaoRepository.minTurno (legado) - HQL original:
    // select min(t.inicio) from TurnoEducacao t
    public static final String SQL_MIN_TURNO =
            "SELECT min(t.inicio) FROM edc_turno t";

    public Uni<java.util.List<Object>> minTurno() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MIN_TURNO)

                        .getResultList());
    }


    // Migrado de TurnoEducacaoRepository.maxTurno (legado) - HQL original:
    // select max(t.fim) from TurnoEducacao t
    public static final String SQL_MAX_TURNO =
            "SELECT max(t.fim) FROM edc_turno t";

    public Uni<java.util.List<Object>> maxTurno() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_MAX_TURNO)

                        .getResultList());
    }

}