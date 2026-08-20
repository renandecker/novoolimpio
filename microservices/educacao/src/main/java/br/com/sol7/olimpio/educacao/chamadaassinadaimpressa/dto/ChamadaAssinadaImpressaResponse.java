package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa;

import java.util.Date;

public record ChamadaAssinadaImpressaResponse(Long id,Date data,Long oferecimentoComponenteCurricularId,Integer sequencia,Integer quantidade,boolean aulaCoringa,boolean ativo,Date inicio,Date fim,boolean pendente){}
