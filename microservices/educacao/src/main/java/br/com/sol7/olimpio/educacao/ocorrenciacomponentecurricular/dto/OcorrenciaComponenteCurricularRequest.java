package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;

import java.util.Date;

public record OcorrenciaComponenteCurricularRequest(Long professorId,Long salaId,boolean ativo,Long oferecimentoComponenteCurricularId,Date data,Long diaAulaId,Boolean aulaCoringa,Boolean aulaPresencial){}
