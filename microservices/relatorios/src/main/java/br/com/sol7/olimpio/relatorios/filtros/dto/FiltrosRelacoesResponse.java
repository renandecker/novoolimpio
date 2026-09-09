package br.com.sol7.olimpio.relatorios.filtros.dto;

import java.util.List;

public record FiltrosRelacoesResponse(
        List<String> informacoes,
        List<FiltroRelatorioItem> tabelas,
        List<FiltroRelatorioItem> graficos,
        List<FiltroRelatorioItem> mapas,
        List<FiltroRelatorioItem> organogramas,
        List<FiltroPermissaoItem> usuarios,
        List<FiltroPermissaoItem> unidades,
        List<FiltroPermissaoItem> perfis
) {
}