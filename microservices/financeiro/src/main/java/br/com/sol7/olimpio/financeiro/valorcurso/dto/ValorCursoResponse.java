package br.com.sol7.olimpio.financeiro.valorcurso;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ValorCursoResponse(Long id,LocalDate data,Integer curriculoId,BigDecimal valor,Boolean valorHora,BigDecimal descontoCarne,BigDecimal valorDescontoAluno,Integer diasToleranciaMulta,Integer diasSpc,BigDecimal juros,BigDecimal multa,BigDecimal percDescJurMul,BigDecimal percDescValor,BigDecimal percValorMinEntrada,Integer prazoParcEntrada,Integer prazoParcSegunda,BigDecimal qtdeParcelas,Boolean cobraRematricula){}
