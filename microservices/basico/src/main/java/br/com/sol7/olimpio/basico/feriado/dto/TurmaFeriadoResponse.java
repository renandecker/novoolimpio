package br.com.sol7.olimpio.basico.feriado.dto;

import java.util.Date;

public record TurmaFeriadoResponse(
        Long id,
        Date data,
        Long oferecimentoId,
        String grupoNome,
        String unidadeSucinto,
        String cursoNome,
        String componenteCurricularDescricao,
        Integer cargaHoraria,
        String status,
        Integer inscritos,
        Integer vagas,
        String diaSemanaNome,
        String turnoDescricao,
        String tempoAulaDescricao
) {}