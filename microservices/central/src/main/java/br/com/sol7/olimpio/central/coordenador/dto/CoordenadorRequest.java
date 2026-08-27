package br.com.sol7.olimpio.central.coordenador;

import java.util.Date;

public record CoordenadorRequest(
        Long idOperador,
        Long idCoordenador,
        Date data,
        Integer ligacao,
        Integer meta,
        Integer agendado,
        Integer pausa,
        Integer prioritario
) {}
