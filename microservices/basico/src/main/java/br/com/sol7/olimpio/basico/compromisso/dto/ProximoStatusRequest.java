package br.com.sol7.olimpio.basico.compromisso.dto;

import java.util.List;

public record ProximoStatusRequest(String observacao, List<Long> resultadoIds, Long atendenteId, List<Long> testemunhaIds) {}