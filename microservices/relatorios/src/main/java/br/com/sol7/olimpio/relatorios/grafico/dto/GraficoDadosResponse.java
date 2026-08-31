package br.com.sol7.olimpio.relatorios.grafico.dto;

import java.util.List;
import java.util.Map;

public record GraficoDadosResponse(
        Long id,
        String nome,
        String tipo,
        String ordemGrafico,
        boolean exibirPercentual,
        boolean exibirLegenda,
        boolean exibirValor,
        boolean valorAcumulado,
        int limite,
        String posicao,
        List<Map<String, Object>> linhas,
        List<Map<String, Object>> linhasCombinado
) {
}
