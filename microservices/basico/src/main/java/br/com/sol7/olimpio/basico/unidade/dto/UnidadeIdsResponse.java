package br.com.sol7.olimpio.basico.unidade.dto;

import java.util.List;

/**
 * Migrado de UnidadeController.carregarProfessores/carregarCurriculos (legado): entidades
 * disponiveis para o usuario logado e quais delas ja estao vinculadas a unidade.
 */
public record UnidadeIdsResponse(List<Long> itens, List<Long> itensMarcados) {
}