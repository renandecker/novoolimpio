package br.com.sol7.olimpio.relatorios.documento.dto;

public record DocumentExportResponse(
    String fileName,
    String contentType,
    String base64Data
) {}