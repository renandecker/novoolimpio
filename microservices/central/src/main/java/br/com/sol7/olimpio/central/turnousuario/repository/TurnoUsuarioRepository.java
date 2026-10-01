package br.com.sol7.olimpio.central.turnousuario;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class TurnoUsuarioRepository implements PanacheRepositoryBase<TurnoUsuario, TurnoUsuario.TurnoUsuarioId> {

    // Select tu.turnoTrabalho from TurnoUsuario tu where tu.usuario = ?1 order by tu.turnoTrabalho.inicio
    public static final String SQL_BUSCAR_TURNO =
            "SELECT tu.id_turno FROM cen_turno_usuario tu LEFT JOIN cen_turno_trabalho j_tu_turnoTrabalho ON j_tu_turnoTrabalho.id = tu.id_turno WHERE tu.id_usuario = ?1 ORDER BY j_tu_turnoTrabalho.inicio";

    public Uni<java.util.List<Object>> buscarTurno(Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TURNO)
                        .setParameter(1, operadorId)
                        .getResultList());
    }


    // Select tu.turnoTrabalho from TurnoUsuario tu where tu.usuario = ?1 AND tu.turnoTrabalho.diaSemana.id = ?2 order by tu.turnoTrabalho.inicio
    public static final String SQL_BUSCAR_TURNO_DIA_SEMANA =
            "SELECT tu.id_turno FROM cen_turno_usuario tu LEFT JOIN cen_turno_trabalho j_tu_turnoTrabalho ON j_tu_turnoTrabalho.id = tu.id_turno LEFT JOIN bas_dia_semana j_j_tu_turnoTrabalho_diaSemana ON j_j_tu_turnoTrabalho_diaSemana.id = j_tu_turnoTrabalho.id_dia_semana WHERE tu.id_usuario = ?1 AND j_j_tu_turnoTrabalho_diaSemana.id = ?2 ORDER BY j_tu_turnoTrabalho.inicio";

    public Uni<java.util.List<Object>> buscarTurnoDiaSemana(Long operadorId, int diaSemana) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TURNO_DIA_SEMANA)
                        .setParameter(1, operadorId)
                        .setParameter(2, diaSemana)
                        .getResultList());
    }


    // Select tu.turnoTrabalho from TurnoUsuario tu where tu.usuario = ?1 AND tu.turnoTrabalho.diaSemana.id = ?2 order by tu.turnoTrabalho.inicio
    public static final String SQL_VERIFICAR_TURNO_DIA_SEMANA =
            "SELECT tu.id_turno FROM cen_turno_usuario tu LEFT JOIN cen_turno_trabalho j_tu_turnoTrabalho ON j_tu_turnoTrabalho.id = tu.id_turno LEFT JOIN bas_dia_semana j_j_tu_turnoTrabalho_diaSemana ON j_j_tu_turnoTrabalho_diaSemana.id = j_tu_turnoTrabalho.id_dia_semana WHERE tu.id_usuario = ?1 AND j_j_tu_turnoTrabalho_diaSemana.id = ?2 ORDER BY j_tu_turnoTrabalho.inicio LIMIT 10";

    public Uni<java.util.List<Object>> verificarTurnoDiaSemana(Long operadorId, int diaSemana) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_TURNO_DIA_SEMANA)
                        .setParameter(1, operadorId)
                        .setParameter(2, diaSemana)
                        .getResultList());
    }


    // Select tu from TurnoUsuario tu where tu.usuario = ?1
    public static final String SQL_BUSCAR_TURNO_USUARIO =
            "SELECT tu.* FROM cen_turno_usuario tu WHERE tu.id_usuario = ?1";

    public Uni<java.util.List<TurnoUsuario>> buscarTurnoUsuario(Long operadorId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_TURNO_USUARIO, TurnoUsuario.class)
                        .setParameter(1, operadorId)
                        .getResultList());
    }

}