package br.com.sol7.olimpio.educacao.horarioperiodo;
import java.time.LocalTime;
import java.util.Date;

public record HorarioPeriodoRequest(String descricao, Long periodoId, Long turnoEducacaoId, Date dataInicio, Date dataFim, LocalTime horaInicio, LocalTime horaFim, int minutosAulaDiario, int minutosAula) {}
