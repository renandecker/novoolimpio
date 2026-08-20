package br.com.sol7.olimpio.basico.agenda.dto;

import jakarta.validation.constraints.NotBlank;

public record AgendaRequest(@NotBlank String descricao,boolean proprio,boolean diasMaximo,
        int quantidadeDiasMaximo,Long tipoAgendaId,Long statusCompromissoId,
        Long statusCompromissoUltimoId,Long unidadeId,@NotBlank String tempoTolerancia){}
