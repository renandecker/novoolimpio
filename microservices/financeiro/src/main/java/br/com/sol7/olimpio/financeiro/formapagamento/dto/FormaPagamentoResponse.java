package br.com.sol7.olimpio.financeiro.formapagamento;
import java.util.Date;
import java.math.BigDecimal;

public record FormaPagamentoResponse(Long id, Integer vezes, BigDecimal juros, BigDecimal desconto, BigDecimal ajusteParcelaAluno, BigDecimal ajusteParcela, String operacao, String tipoRegra, String tipoRegraValor, String periodicidade, Long perfilId, boolean regra, boolean ativo, boolean usado, boolean ajuste, boolean cota, int tipoPessoa, BigDecimal valorRegra, BigDecimal percentualMinimo, BigDecimal percentualMaximo, BigDecimal percentualMinimoAluno, BigDecimal percentualMaximoAluno, Integer valorCota, Integer valorCotaControle, Date dateCotaControle) {}
