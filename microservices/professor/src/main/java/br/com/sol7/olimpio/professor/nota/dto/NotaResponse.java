package br.com.sol7.olimpio.professor.nota.dto;

import java.math.BigDecimal;

public record NotaResponse(Long id,Long notaMatriculaId,Long notaGrauId,Long notaComponenteCurricularMatriculaId,BigDecimal nota,Long notaConceitoId,int ordem){}
