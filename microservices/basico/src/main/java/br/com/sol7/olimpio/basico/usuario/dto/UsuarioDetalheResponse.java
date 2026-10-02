package br.com.sol7.olimpio.basico.usuario.dto;

import java.util.List;

/**
 * Migrado de UsuarioController.buscarDetalhes (legado): perfis, agendas e unidades
 * vinculados ao usuario, exibidos no painel de detalhe.
 */
public record UsuarioDetalheResponse(Long usuarioId, List<Long> perfis, List<Long> agendas,
                                     List<Long> unidades) {
}