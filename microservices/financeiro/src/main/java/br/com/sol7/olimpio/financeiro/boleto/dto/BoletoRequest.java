package br.com.sol7.olimpio.financeiro.boleto.dto;

import br.com.sol7.olimpio.financeiro.boleto.entity.Boleto;

public record BoletoRequest(Long movimentacaoId,String barCode){}
