package br.com.sol7.olimpio.professor.nota.dto;

import java.math.BigDecimal;

public record NotaComponenteCurricularMatriculaRequest(Long matriculaId,BigDecimal nota,Long notaConceitoId,Long grauNotaId,Long grauConceitoId){}
