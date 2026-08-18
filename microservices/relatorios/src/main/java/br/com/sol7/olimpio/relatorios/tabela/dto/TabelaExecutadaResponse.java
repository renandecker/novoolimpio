package br.com.sol7.olimpio.relatorios.tabela.dto;

import java.util.List;
import java.util.Map;

/** Resultado tabular obtido a partir da configuração SQL da tabela, com paginação. */
public record TabelaExecutadaResponse(
        List<String> colunas,
        List<Map<String, Object>> linhas,
        long totalElements,
        int page,
        int size,
        int totalPages
) {
    public TabelaExecutadaResponse(List<String> colunas, List<Map<String, Object>> linhas) {
        this(colunas, linhas, linhas.size(), 0, Math.max(1, linhas.size()), 1);
    }
}
