package br.com.sol7.olimpio.comercial.atendimentoconsultor;

import java.util.Date;
import java.util.List;

public record TurmaOferecidaResponse(
        Long id,
        String status,
        Integer vagas,
        Integer inscritos,
        Date dataInicio,
        Date dataFim,
        Long unidadeId,
        String unidade,
        Long salaId,
        String sala,
        Long componenteCurricularId,
        String componente,
        Long periodoId,
        Long professorId,
        List<TurmaOferecidaDiaAulaResponse> diasAula,
        List<TurmaOferecidaOcorrenciaResponse> ocorrencias
) {
}
