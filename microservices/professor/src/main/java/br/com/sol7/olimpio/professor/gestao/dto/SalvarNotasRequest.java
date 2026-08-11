package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record SalvarNotasRequest(List<NotaSalvarDto> avaliacoes) {

    public record NotaSalvarDto(Long id, Double nota, Long notaConceitoId, List<NotaValorDto> notas) {
    }

    public record NotaValorDto(Long id, Double valor) {
    }
}
