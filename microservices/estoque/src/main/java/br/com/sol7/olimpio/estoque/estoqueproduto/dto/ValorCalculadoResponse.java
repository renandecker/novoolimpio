package br.com.sol7.olimpio.estoque.estoqueproduto;

import java.math.BigDecimal;

// Migrado de EstoqueProdutoController.calcularValorEntrada/calcularValorSolicitacao
public record ValorCalculadoResponse(BigDecimal valorCalculado){}
