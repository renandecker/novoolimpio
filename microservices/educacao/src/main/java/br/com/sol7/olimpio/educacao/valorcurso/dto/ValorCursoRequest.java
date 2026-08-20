package br.com.sol7.olimpio.educacao.valorcurso;

import java.util.Date;
import java.math.BigDecimal;

public record ValorCursoRequest(Date data,int diasSpc,int diasToleranciaMulta,Long curriculoId,BigDecimal valor,BigDecimal juros,BigDecimal multa,BigDecimal descontoCarne,BigDecimal valorDescontoAluno,boolean cobraRematricula,boolean valorHora,BigDecimal percDescJurMul,BigDecimal percDescValor,BigDecimal percValorMinEntrada,Integer prazoParcEntrada,Integer prazoParcSegunda,BigDecimal qtdePacelas){}
