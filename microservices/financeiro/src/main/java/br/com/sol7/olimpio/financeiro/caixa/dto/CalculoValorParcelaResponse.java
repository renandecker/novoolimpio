package br.com.sol7.olimpio.financeiro.caixa.dto;

import java.math.BigDecimal;

import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;

public record CalculoValorParcelaResponse(BigDecimal desconto,BigDecimal multa,BigDecimal juros,BigDecimal valorCobrado){}
