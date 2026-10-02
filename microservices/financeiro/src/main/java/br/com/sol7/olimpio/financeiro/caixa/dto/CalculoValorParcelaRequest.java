package br.com.sol7.olimpio.financeiro.caixa.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;

// (src/main/java/.../control/controllers/financeiro/EfetuarPagamentoController.java:407-519)
// Obs: o legado consultava Parcela e Feriado (banco); aqui os dados sao recebidos prontos do
// microservico comercial/basico, mantendo a formula original intacta e decoupled.
public record CalculoValorParcelaRequest(
        BigDecimal valor,
        LocalDate dataVencimento,
        int parcelaSequencia,          // 0 = entrada/matricula (nunca recebe desconto/multa/juros)
        BigDecimal percentualDesconto,
        BigDecimal percentualMulta,
        BigDecimal percentualJuros,
        int diasToleranciaMulta,
        boolean feriadoNoDiaAnteriorVencimento){}
