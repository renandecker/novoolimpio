package br.com.sol7.olimpio.relatorios.mapa.dto;

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
        BigDecimal meta,
        BigDecimal meta2,
        Integer markerTamanho,
        String condicao,
        Boolean ativo,
        List<Marcador> marcadores
) {}

record Marcador(
        String coordenada,
        BigDecimal valor,
        BigDecimal meta,
        BigDecimal meta2,
        String condicao
) {}