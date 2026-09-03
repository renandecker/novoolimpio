package br.com.sol7.olimpio.relatorios.mapa;

import java.math.BigDecimal;
import java.util.List;

public record MapaPontosResponse(
        String coordenadaCentro,
        String zoom,
        Integer altura,
        Integer markerTamanho,
        List<RegraPontos> regras
) {}

record RegraPontos(
        Long regraId,
        String descricao,
        String cor,
        Integer markerTamanho,
        List<Marcador> marcadores
) {}

record Marcador(
        String latitude,
        String longitude,
        String popup,
        String valorFormatado
) {}