package br.com.sol7.olimpio.educacao.lote.dto;

import java.util.List;

public record LoteNapLigacaoRequest(Long etapasNapId,List<Long> contratoIds){}
