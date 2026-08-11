package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record CadernoDto(TurmaDto turma, List<OcorrenciaDto> ocorrencias, List<AlunoDto> alunos) {
}
