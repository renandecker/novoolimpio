package br.com.sol7.olimpio.central.coordenador;

import java.util.Date;

public record CoordenadorResponse(
        Long id,
        Long idOperador,
        String operadorLogin,
        String operadorNome,
        Long idCoordenador,
        String coordenadorLogin,
        String coordenadorNome,
        Date data,
        Integer ligacao,
        Integer meta,
        Integer agendado,
        Integer pausa,
        Integer prioritario,
        String turno,
        String situacao
) {}
