package br.com.sol7.olimpio.professor.nota.dto;

import java.math.BigDecimal;

public record NotaComponenteCurricularMatriculaResponse(Long id,Long matriculaId,BigDecimal nota,Long notaConceitoId,Long grauNotaId,Long grauConceitoId){}
