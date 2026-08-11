package br.com.sol7.olimpio.professor.disponibilidade.dto;
import java.time.LocalTime;

public record DisponibilidadeProfessorRequest(Long professorId, Long unidadeId, Long tipoContratoId, LocalTime inicio, LocalTime fim, Boolean preAutorizado) {}
