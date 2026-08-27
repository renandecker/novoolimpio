package br.com.sol7.olimpio.basico.documento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DocumentoConfiguracaoResponse(
    Long id,
    String nome,
    String descricao,
    String tipoRelatorio,
    String arquivoModelo,
    boolean ativo
) {}