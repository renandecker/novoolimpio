package br.com.sol7.olimpio.comercial.atendimentoconsultor;

import java.util.Date;

public record TurmaOferecidaOcorrenciaResponse(
        Long id,
        Date data,
        Long diaAulaId,
        Long salaId,
        Long professorId,
        Boolean aulaCoringa,
        Boolean aulaPresencial
) {
}
