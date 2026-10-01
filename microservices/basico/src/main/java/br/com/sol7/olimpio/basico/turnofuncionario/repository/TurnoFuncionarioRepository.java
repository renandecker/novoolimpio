package br.com.sol7.olimpio.basico.turnofuncionario.repository;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.turnofuncionario.entity.TurnoFuncionario;

@ApplicationScoped
public class TurnoFuncionarioRepository implements PanacheRepository<TurnoFuncionario> {

    // select t from TurnoFuncionario t left join fetch t.turnoTrabalhos tt where t = ?1 order by tt.inicio, tt.diaSemana
    public static final String SQL_LISTAR_TURNOS_CARREGADO =
            "SELECT t.* FROM bas_turno_funcionario t LEFT JOIN bas_turno_trabalho_funcionario t_tt_jt ON t_tt_jt.id_turno_funcionario = t.id LEFT JOIN cen_turno_trabalho tt ON tt.id = t_tt_jt.id_turno_trabalho WHERE t.id = ?1 ORDER BY tt.inicio, tt.id_dia_semana";

    public Uni<java.util.List<TurnoFuncionario>> listarTurnosCarregado(Long turnoFuncionarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_LISTAR_TURNOS_CARREGADO, TurnoFuncionario.class)
                        .setParameter(1, turnoFuncionarioId)
                        .getResultList());
    }

}