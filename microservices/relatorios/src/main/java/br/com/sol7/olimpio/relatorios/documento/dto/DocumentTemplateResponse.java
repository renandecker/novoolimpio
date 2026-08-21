package br.com.sol7.olimpio.relatorios.documento.dto;

import java.time.LocalDateTime;

public record DocumentTemplateResponse(
    Long id,
    String nome,
    String descricao,
    String arquivoNome,
    String tipoRelatorio,
    Long relatorioId,
    Boolean ativo,
    LocalDateTime dataCadastro,
    LocalDateTime dataAlteracao,
    Long usuarioId
) {}