package br.com.sol7.olimpio.professor.professor.dto;
import java.util.Date;

public record ProfessorRequest(Long pessoaId, Boolean ativo, Boolean cadernoBola, Date dataInicio, Date dataFim) {}
