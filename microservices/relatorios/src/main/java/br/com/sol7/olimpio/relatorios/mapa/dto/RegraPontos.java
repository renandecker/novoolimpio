package br.com.sol7.olimpio.relatorios.mapa.dto;

import java.util.List;

public record RegraPontos(
        Long regraId,
        String descricao,
        String cor,
        Integer markerTamanho,
        List<Marcador> marcadores
) {}