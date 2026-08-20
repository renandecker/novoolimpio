package br.com.sol7.olimpio.basico.horario.repository;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.horario.entity.Horario;

@ApplicationScoped
public class HorarioRepository implements PanacheRepository<Horario> {

    // Migrado de HorarioRepository.autoComplete (legado) - HQL original:
    // Select h from Horario h where h.hora like '%' || ?1 || '%'  order by h.hora
    public static final String SQL_AUTO_COMPLETE =
            "SELECT h.* FROM bas_horario h WHERE h.hora like '%' || ?1 || '%' ORDER BY h.hora";

    public Uni<java.util.List<Horario>> autoComplete(String query) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, Horario.class)
                        .setParameter(1, query)
                        .getResultList());
    }


    // Migrado de HorarioRepository.buscarHorarioPorHora (legado) - HQL original:
    // select h from Horario h where h.hora = ?1
    public static final String SQL_BUSCAR_HORARIO_POR_HORA =
            "SELECT h.* FROM bas_horario h WHERE h.hora = ?1";

    public Uni<java.util.List<Horario>> buscarHorarioPorHora(String hora) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_HORARIO_POR_HORA, Horario.class)
                        .setParameter(1, hora)
                        .getResultList());
    }


    // Migrado de HorarioRepository.buscarHorariosPrenchidos (legado) - HQL original:
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

}