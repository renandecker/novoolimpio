package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record AlunoDto(Long matriculaId, String nome, Boolean ativo, List<PresencaDto> presencas) {
}
