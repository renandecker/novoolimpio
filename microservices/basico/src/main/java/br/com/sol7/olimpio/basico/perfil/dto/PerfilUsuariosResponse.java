package br.com.sol7.olimpio.basico.perfil.dto;

import java.util.List;

/**
 * Migrado de PerfilController.carregarUsuarios (legado): usuarios visiveis para o usuario
 * logado e quais deles ja possuem o perfil selecionado.
 */
public record PerfilUsuariosResponse(List<Long> itens, List<Long> itensMarcados) {
}