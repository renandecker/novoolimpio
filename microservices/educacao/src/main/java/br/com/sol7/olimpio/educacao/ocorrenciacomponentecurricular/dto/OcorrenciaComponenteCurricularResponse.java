package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;

import java.util.Date;

public record OcorrenciaComponenteCurricularResponse(Long id,Long professorId,Long salaId,boolean ativo,Long oferecimentoComponenteCurricularId,Date data,Long diaAulaId,Boolean aulaCoringa,Boolean aulaPresencial,
        String professor_descricao,String sala_descricao,String diaAula_descricao,String oferecimentoComponenteCurricular_descricao){}
