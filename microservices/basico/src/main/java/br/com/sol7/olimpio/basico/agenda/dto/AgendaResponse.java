package br.com.sol7.olimpio.basico.agenda.dto;

public record AgendaResponse(Long id,String descricao,boolean proprio,boolean diasMaximo,
        int quantidadeDiasMaximo,Long tipoAgendaId,Long statusCompromissoId,
        Long statusCompromissoUltimoId,Long unidadeId,String tempoTolerancia){}
