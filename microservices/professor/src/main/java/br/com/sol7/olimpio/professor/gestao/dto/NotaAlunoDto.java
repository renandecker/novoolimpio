package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record NotaAlunoDto(Long id, Long matriculaId, String aluno, Long grauNotaId, Long grauConceitoId,
                           Double nota, Long notaConceitoId, List<NotaDto> notas) {
}
