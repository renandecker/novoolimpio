package br.com.sol7.olimpio.financeiro.caixa.dto;

import java.math.BigDecimal;

import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;

public record FechamentoCaixaTotaisResponse(
        Long caixaId,
        BigDecimal totalFundoCaixa,
        BigDecimal totalDinheiro,
        BigDecimal totalCheque,
        BigDecimal totalCartao,
        BigDecimal totalBoleto,
        BigDecimal totalTransferencia,
        BigDecimal totalDeposito,
        BigDecimal totalSangria,
        BigDecimal totalDinheiroCaixa,
        BigDecimal totalValor,
        BigDecimal totalDesconto,
        BigDecimal totalJurosMulta,
        BigDecimal totalValorPagar){}
