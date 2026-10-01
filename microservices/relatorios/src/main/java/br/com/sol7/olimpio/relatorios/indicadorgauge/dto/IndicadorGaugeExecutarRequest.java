package br.com.sol7.olimpio.relatorios.indicadorgauge.dto;

import java.util.Map;

/**
 * @param sql              SQL do indicador
 * @param indicadorGaugeId identificador do indicador, usado para resolver os filtros vinculados
 * @param filtros          { nome do filtro -> { operation, value, value2, selected } }
 */
public record IndicadorGaugeExecutarRequest(String sql, Long indicadorGaugeId, Map<String, Object> filtros) {

    public IndicadorGaugeExecutarRequest(String sql) {
        this(sql, null, null);
    }
}