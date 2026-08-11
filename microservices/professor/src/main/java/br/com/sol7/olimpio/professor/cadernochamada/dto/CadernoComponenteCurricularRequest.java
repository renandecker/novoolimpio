package br.com.sol7.olimpio.professor.cadernochamada.dto;
import java.util.Date;

public record CadernoComponenteCurricularRequest(Long ocorrenciaComponenteCurricularId, Long matriculaId, Date dataAlteracao, Character presenca) {}
