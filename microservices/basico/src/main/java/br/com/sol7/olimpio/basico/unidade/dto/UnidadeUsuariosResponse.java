package br.com.sol7.olimpio.basico.unidade.dto;

import java.util.List;

/**
 * Migrado de UnidadeController.carregarUsuarios (legado): usuarios disponiveis para o usuario
 * logado e quais deles ja estao vinculados a unidade.
 */
public record UnidadeUsuariosResponse(List<Long> usuarios, List<Long> usuariosMarcados) {
}