package br.com.sol7.olimpio.relatorios.extrator.dto;

import java.util.Map;

public record ExportRequest(
    Long extratorId,
    Long tabelaId,
    Long usuarioId,
    String tipo,
    String sql,
    Map<String, Object> filtros
) {}
