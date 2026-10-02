package br.com.sol7.olimpio.basico.compromisso.dto;

import java.util.Date;

/**
 * Migrado de central.CompromissoPessoaStatus (legado) - historico de mudanca de status
 * de um compromisso. Exposto aqui porque a tabela bas_compromisso_pessoa_status e lida
 * pelo calendario de compromissos do modulo basico.
 */
public record CompromissoPessoaStatusResponse(Long id, Long compromissoId, Long statusAnteriorId,
                                             Long statusProximoId, Long pessoaId, Long usuarioId,
                                             Date data) {
}