package br.com.sol7.olimpio.educacao.grau;
import java.math.BigDecimal;

public record GrauResponse(Long id, String descricao, String tipoGrau, BigDecimal frequenciaMinima, BigDecimal mediaSemExame, BigDecimal mediaFinal, BigDecimal notaMaxima, Integer conceitoSemExame, Integer conceitoFinal, boolean cancelado, boolean limiteManual, boolean limiteManualAluno, boolean recuperacao, boolean manual, boolean manualAluno, boolean pesoDistinto, int notasParciais) {}
