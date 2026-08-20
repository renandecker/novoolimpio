package br.com.sol7.olimpio.financeiro.caixa.dto;

import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento;

import java.math.BigDecimal;

import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;

// Migrado de EfetuarPagamentoController.salvarPagamento (src/main/java/.../EfetuarPagamentoController.java:716)
public record RegistrarPagamentoParcelaRequest(
        Long caixaId,
        Long parcelaId,
        Long usuarioId,
        BigDecimal valorCobrado,
        BigDecimal desconto,
        BigDecimal multaJuros,
        java.util.List<MovimentacaoPagamento> movimentacoes){

public record MovimentacaoPagamento(TipoPagamento tipoPagamento,BigDecimal valor,String documento){}
        }
