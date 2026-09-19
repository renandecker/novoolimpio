package br.com.sol7.olimpio.relatorios.indicadorgauge.dto;

import java.util.Date;

public record IndicadorGaugeRequest(
    String nome,
    String sql,
    String configuracao,
    Date createdAt,
    Date updatedAt
) {}