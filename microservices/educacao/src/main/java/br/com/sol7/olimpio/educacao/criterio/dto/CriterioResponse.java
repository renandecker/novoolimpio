package br.com.sol7.olimpio.educacao.criterio;
import java.util.Date;

public record CriterioResponse(Long id, Long unidadeId, Long curriculoId, boolean mes, int periodo, int qtdTurmaAbertas, int qtdAulasToleraciaMatricula, Date dataInicio, Date dataFim, String tipoMatricula) {}
