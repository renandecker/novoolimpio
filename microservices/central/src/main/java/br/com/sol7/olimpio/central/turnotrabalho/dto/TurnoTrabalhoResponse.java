package br.com.sol7.olimpio.central.turnotrabalho;

import java.util.List;

public record TurnoTrabalhoResponse(Long id, String descricao, String inicio, String fim, Long diaSemanaId, String diaSemanaNome, List<Long> unidadeIds, Double horasParaTrabalhar) {}
