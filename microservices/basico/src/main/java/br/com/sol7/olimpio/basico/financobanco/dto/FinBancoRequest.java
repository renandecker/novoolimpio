package br.com.sol7.olimpio.basico.financobanco.dto;

import jakarta.validation.constraints.NotBlank;

public record FinBancoRequest(
        @NotBlank(message = "Unidade e obrigatoria") Long unidadeId,
        @NotBlank(message = "Provedor e obrigatorio") String provedor,
        @NotBlank(message = "Chave e obrigatoria") String chave,
        String valor,
        Boolean ativo
) {
}
