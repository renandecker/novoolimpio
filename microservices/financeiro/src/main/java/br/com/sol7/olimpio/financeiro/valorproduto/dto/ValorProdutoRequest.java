package br.com.sol7.olimpio.financeiro.valorproduto;
import java.math.BigDecimal;

public record ValorProdutoRequest(int vezes, BigDecimal juros, BigDecimal desconto, BigDecimal multa, int diasSpc, int diasToleranciaMulta) {}
