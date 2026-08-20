package br.com.sol7.olimpio.financeiro.boleto.dto;

import br.com.sol7.olimpio.financeiro.boleto.entity.Boleto;

public record BoletoResponse(Long id,Long movimentacaoId,String barCode){}
