package br.com.sol7.olimpio.educacao.diaaula;

import java.time.LocalTime;

public record DiaAulaResponse(Long id,Long diaSemanaId,Long turnoEducacaoId,Long tempoAulaId,
        String turnoEducacao_descricao,String tempoAula_descricao,
        LocalTime turnoInicio,LocalTime turnoFim,Integer tempoAulaMinutos){}
