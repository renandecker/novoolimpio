package br.com.sol7.olimpio.financeiro.lote.dto;

import java.util.List;

public record LoteCobrancaLigacaoRequest(Long etapasCobrancaId,List<Long> contratoIds){}
