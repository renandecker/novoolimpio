package br.com.sol7.olimpio.basico.agenda.dto;

import java.util.List;

/**
 * Migrado de AgendaController.carregarUsuarios (legado): lista os usuarios que o usuario
 * logado pode selecionar (unidades disponiveis) e quais deles ja estao marcados na agenda.
 */
public record AgendaUsuariosResponse(List<Long> usuarios, List<Long> usuariosMarcados) {
}