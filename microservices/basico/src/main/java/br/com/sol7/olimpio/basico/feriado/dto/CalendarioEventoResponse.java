package br.com.sol7.olimpio.basico.feriado.dto;

import java.util.Date;

public record CalendarioEventoResponse(
        Long id,
        String title,
        Date start,
        String color,
        Boolean feriadoFixo,
        Boolean nacional,
        String descricao
) {
}