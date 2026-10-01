package br.com.sol7.olimpio.basico.horario.repository;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.horario.entity.Horario;

@ApplicationScoped
public class HorarioRepository implements PanacheRepository<Horario> {

    // Select h from Horario h where h.hora like '%' || ?1 || '%'  order by h.hora
    public static final String SQL_AUTO_COMPLETE =
            "SELECT h.* FROM bas_horario h WHERE h.hora like '%' || ?1 || '%' ORDER BY h.hora";

    public Uni<java.util.List<Horario>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Horario.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // select h from Horario h where h.hora = ?1
    public static final String SQL_BUSCAR_HORARIO_POR_HORA =
            "SELECT h.* FROM bas_horario h WHERE h.hora = ?1";

    public Uni<java.util.List<Horario>> buscarHorarioPorHora(String hora) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HORARIO_POR_HORA, Horario.class)
                        .setParameter(1, hora)
                        .getResultList());
    }


    // select c2.horario from Compromisso c2 where c2.agenda = ?1 AND c2.data = ?2
    public static final String SQL_BUSCAR_HORARIOS_PRENCHIDOS =
            "SELECT c2.id_horario FROM bas_compromisso c2 WHERE c2.id_agenda = ?1 AND c2.data = ?2";

    public Uni<java.util.List<Object>> buscarHorariosPrenchidos(Long agendaId, Date data) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HORARIOS_PRENCHIDOS)
                        .setParameter(1, agendaId)
                        .setParameter(2, data)
                        .getResultList());
    }

    // Horarios disponiveis por consultor (exclui horarios ja preenchidos na data)
    public static final String SQL_DISPONIVEIS_POR_CONSULTOR =
            "SELECT h.* FROM bas_horario h " +
            " WHERE h.id NOT IN (SELECT c.id_horario FROM bas_compromisso c WHERE c.id_agenda = ?1 AND c.data = ?2) " +
            " ORDER BY h.hora";

    public Uni<java.util.List<Horario>> disponiveisPorConsultor(Long agendaId, Date data, int diaSemana) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_DISPONIVEIS_POR_CONSULTOR, Horario.class)
                        .setParameter(1, agendaId)
                        .setParameter(2, data)
                        .getResultList());
    }

    // Horarios disponiveis por turno da unidade do usuario
    public static final String SQL_DISPONIVEIS_POR_TURNO_UNIDADE =
            "SELECT h.* FROM bas_horario h " +
            " JOIN bas_turno_horario th ON th.id_horario = h.id " +
            " JOIN bas_turno_usuario tu ON tu.id_turno = th.id_turno " +
            " WHERE tu.id_usuario = ?1 AND th.id_dia_semana = ?2 " +
            " ORDER BY h.hora";

    public Uni<java.util.List<Horario>> disponiveisPorTurnoUnidade(Long usuarioId, int diaSemana) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_DISPONIVEIS_POR_TURNO_UNIDADE, Horario.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, diaSemana)
                        .getResultList());
    }

}