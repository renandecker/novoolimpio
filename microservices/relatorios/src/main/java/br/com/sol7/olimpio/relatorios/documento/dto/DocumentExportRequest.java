package br.com.sol7.olimpio.relatorios.documento.dto;

import java.util.Map;

public record DocumentExportRequest(
    String tipoExportacao,
    Long templateId,
    Map<String, Object> parametros
) {}