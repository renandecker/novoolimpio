package br.com.sol7.olimpio.basico.financobanco.dto;

public record FinBancoResponse(
        Long id,
        Long unidadeId,
        String provedor,
        String chave,
        String valor,
        Boolean ativo
) {
}
