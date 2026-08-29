package br.com.sol7.olimpio.educacao.disponibilidadeprofessor.dto;

import java.time.LocalDate;
import java.util.List;

public record DisponibilidadeProfessorRequest(
        Long professorId,
        Long unidadeId,
        Long tipoContratoId,
        LocalDate inicio,
        LocalDate fim,
        Boolean preAutorizado,
        List<Long> diasSemanaIds
) {
}