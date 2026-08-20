package br.com.sol7.olimpio.professor.cadernochamada.dto;

import java.util.Date;

public record HistoricoCadernoChamadaResponse(Long id,Long usuarioId,Date data,Long matriculaId,Long ocorrenciaComponenteCurricularId,Character presencaAnterior,Character presencaPosterior){}
