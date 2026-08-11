package br.com.sol7.olimpio.professor.professor.dto;
import java.util.Date;

public record ProfessorResponse(Long id, Long pessoaId, Boolean ativo, Boolean cadernoBola, Date dataInicio, Date dataFim) {}
