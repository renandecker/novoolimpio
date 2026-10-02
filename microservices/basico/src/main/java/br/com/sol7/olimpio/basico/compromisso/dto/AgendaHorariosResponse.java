package br.com.sol7.olimpio.basico.compromisso.dto;

import java.util.Date;
import java.util.List;

import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;

/**
 * Migrado de CompromissoController.atualizarHorariosResultados (legado): ao escolher a
 * agenda e a data, o legado recarregava a lista de resultados disponiveis da agenda e os
 * horarios livres. Aqui os dois conjuntos sao devolvidos no mesmo contrato.
 */
public record AgendaHorariosResponse(Long agendaId, Date data, int tipoHorario,
                                     List<Long> resultados, List<HorarioResponse> horarios) {
}