package br.com.sol7.olimpio.professor.nota.dto;
import java.math.BigDecimal;

public record NotaRequest(Long notaMatriculaId, Long notaGrauId, Long notaComponenteCurricularMatriculaId, BigDecimal nota, Long notaConceitoId, int ordem) {}
