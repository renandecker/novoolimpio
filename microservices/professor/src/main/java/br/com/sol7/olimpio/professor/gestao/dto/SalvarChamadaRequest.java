package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record SalvarChamadaRequest(Long usuarioId, List<PresencaSalvarDto> presencas) {

    public record PresencaSalvarDto(Long id, Long matriculaId, Long ocorrenciaId, String presenca) {
    }
}
