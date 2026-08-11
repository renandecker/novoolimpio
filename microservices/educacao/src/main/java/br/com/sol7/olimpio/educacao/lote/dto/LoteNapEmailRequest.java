package br.com.sol7.olimpio.educacao.lote.dto;

import java.util.List;

public record LoteNapEmailRequest(Long etapasNapId, Long mensagemId, List<Long> contratoIds) {}
