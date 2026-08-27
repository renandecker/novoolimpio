package br.com.sol7.olimpio.basico.documento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DocumentoConfiguracaoRequest(
    @NotBlank @Size(max = 100) String nome,
    @Size(max = 500) String descricao,
    @Size(max = 50) String tipoRelatorio,
    @Size(max = 200) String arquivoModelo,
    boolean ativo
) {}