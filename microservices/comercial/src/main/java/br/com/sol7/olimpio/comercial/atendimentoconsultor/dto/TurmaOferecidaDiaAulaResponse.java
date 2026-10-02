package br.com.sol7.olimpio.comercial.atendimentoconsultor;

public record TurmaOferecidaDiaAulaResponse(
        Long diaAulaId,
        Long diaSemanaId,
        String diaSemana,
        Long turnoId,
        String turno,
        String turnoInicio,
        String turnoFim
) {
}
