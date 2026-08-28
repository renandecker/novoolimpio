package br.com.sol7.olimpio.central.filaprioritaria;

import java.util.Date;

public record FilaPrioritariaResponse(Long id, Long ligacaoId, Long ordemLigacaoId, Date data, String status, Long usuarioId) {}