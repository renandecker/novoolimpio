package br.com.sol7.olimpio.professor.cadernochamada.dto;
import java.util.Date;

public record CadernoComponenteCurricularResponse(Long id, Long ocorrenciaComponenteCurricularId, Long matriculaId, Date dataAlteracao, Character presenca) {}
