package br.com.sol7.olimpio.relatorios.documento.dto;

public record DocumentTemplateRequest(
    String nome,
    String descricao,
    String arquivoNome,
    String arquivoDadosBase64,
    String tipoRelatorio,
    Long relatorioId,
    Boolean ativo
) {}