package br.com.sol7.olimpio.educacao.periodo;
import java.util.Date;
import java.math.BigDecimal;

public record PeriodoResponse(Long id, String descricao, Long tipoCursoId, Date dataInicio, Date dataFim, Integer frequenciaMinima, BigDecimal mediaSemExame, BigDecimal mediaFinal, String conceitoFinal) {}
