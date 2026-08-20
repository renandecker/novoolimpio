package br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto;

import java.math.BigDecimal;
import java.util.Date;

import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.MovimentacaoFinanceira;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento;

public record MovimentacaoFinanceiraResponse(Long id,Date dataMovimento,String historico,String vencimento,BigDecimal valor,
        String documento,BigDecimal quantidade,String especie,BigDecimal valorTroco,
        Long caixaId,Long movimentoId,Long tipoHistoricoId,Long contaCorrenteId,
        TipoPagamento tipoPagamento,Long usuarioId,Long parcelaId,
        BigDecimal desconto,BigDecimal multaJuros){}
