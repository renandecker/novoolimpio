package br.com.sol7.olimpio.relatorios.filtros.dto;

import java.util.List;

public record FiltrosRelacoesRequest(
        List<String> informacoes,
        List<Long> tabelasIds,
        List<Long> graficosIds,
        List<Long> mapasIds,
        List<Long> organogramasIds,
        List<Long> usuariosIds,
        List<Long> unidadesIds,
        List<Long> perfisIds
) {
}