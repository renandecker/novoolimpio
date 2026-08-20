package br.com.sol7.olimpio.educacao.matricula;

import java.util.Date;
import java.math.BigDecimal;

public record MatriculaResponse(Long id,Long oferecimentoComponenteCurricularId,Long contratoId,Long cadernoComponenteCurricularId,Long formaPagamentoId,Date dataCancelamento,String motivoCancelamento,String status,BigDecimal mediaFinal,BigDecimal percentualPresenca,int qtdeChamadaFrequencia,Date data,int totalAulas,int totalAulasFeitas,int totalAulasPresente,int totalAulasMeiaPresenca,int totalFaltas,boolean cancelamentoProprio,boolean trocaTurma,Long cancelamentoId){}
