package br.com.sol7.olimpio.central.filaprioritaria;

import java.util.Date;

public record FilaPrioritariaRequest(Long ligacaoId, Long ordemLigacaoId, Date data, String status, Long usuarioId) {}