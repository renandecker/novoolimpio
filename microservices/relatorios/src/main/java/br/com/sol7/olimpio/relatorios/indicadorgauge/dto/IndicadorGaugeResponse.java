package br.com.sol7.olimpio.relatorios.indicadorgauge.dto;

import java.util.Date;

public record IndicadorGaugeResponse(
    Long id,
    String nome,
    String sql,
    String configuracao,
    Date createdAt,
    Date updatedAt
) {}