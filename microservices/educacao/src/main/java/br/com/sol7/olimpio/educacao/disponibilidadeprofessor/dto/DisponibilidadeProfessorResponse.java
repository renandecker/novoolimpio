package br.com.sol7.olimpio.educacao.disponibilidadeprofessor.dto;

import java.time.LocalDate;
import java.util.List;

public record DisponibilidadeProfessorResponse(
        Long id,
        Long professorId,
        String professorNome,
        Long unidadeId,
        String unidadeNome,
        Long tipoContratoId,
        String tipoContratoNome,
        LocalDate inicio,
        LocalDate fim,
        Boolean preAutorizado,
        List<Long> diasSemanaIds
) {
}