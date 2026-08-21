package br.com.sol7.olimpio.relatorios.documento.dto;

import java.util.List;

public record DocumentTemplateOpcoesResponse(
    String tipoRelatorio,
    Long relatorioId,
    List<DocumentTemplateResponse> templates
) {}