package br.com.sol7.olimpio.basico.horario.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;
import br.com.sol7.olimpio.basico.horario.entity.Horario;
import br.com.sol7.olimpio.basico.horario.repository.HorarioRepository;

/**
 * Regra de negocio extraida de CompromissoController.trocaTipoHorario e
 * CalendarioAgendaController.trocaTipoHorario (legado), compartilhada pelos dois fluxos.
 *
 * tipoHorario: 0 = nao calcula, 1 = agenda compartilhada (turnos das unidades do usuario),
 * 2 = consultores da agenda (exclui os horarios ja preenchidos na data).
 */
@ApplicationScoped
@WithTransaction
public class HorarioDisponivelService {

    public static final int TIPO_NENHUM = 0;
    public static final int TIPO_UNIDADES = 1;
    public static final int TIPO_CONSULTORES = 2;

    @Inject
    HorarioRepository repository;

    public Uni<List<HorarioResponse>> buscarDisponiveis(Long agendaId, Long usuarioId, Date data, int tipoHorario) {
        if (tipoHorario == TIPO_NENHUM || data == null) {
            return Uni.createFrom().item(List.of());
        }
        Calendar calendario = Calendar.getInstance();
        calendario.setTime(data);
        int diaSemana = calendario.get(Calendar.DAY_OF_WEEK);
        Uni<List<Horario>> horarios = tipoHorario == TIPO_CONSULTORES
                ? repository.disponiveisPorConsultor(agendaId, data, diaSemana)
                : repository.disponiveisPorTurnoUnidade(usuarioId, diaSemana);
        return horarios.map(items -> items.stream().map(this::toResponse).toList());
    }

    private HorarioResponse toResponse(Horario h) {
        return new HorarioResponse(h.id, h.hora);
    }
}