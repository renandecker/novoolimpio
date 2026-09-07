package br.com.sol7.olimpio.basico.feriado.dto;

import java.util.Date;

public record OcorrenciaFeriadoResponse(
        Long id,
        Date data,
        Long oferecimentoComponenteCurricularId,
        String oferecimentoDescricao,
        Long grupoId,
        String grupoNome,
        Long unidadeId,
        String unidadeSucinto,
        Long cursoId,
        String cursoNome,
        Long componenteCurricularId,
        String componenteCurricularDescricao,
        Integer cargaHoraria,
        String status,
        Integer inscritos,
        Integer vagas,
        Long diaAulaId,
        String diaSemanaNome,
        String turnoDescricao,
        String tempoAulaDescricao
) {
}