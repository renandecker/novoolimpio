package br.com.sol7.olimpio.relatorios.mapa.dto;

import java.util.List;

public record MapaPontosResponse(
        String coordenadaCentro,
        String zoom,
        Integer altura,
        Integer markerTamanho,
        List<RegraPontos> regras
) {}