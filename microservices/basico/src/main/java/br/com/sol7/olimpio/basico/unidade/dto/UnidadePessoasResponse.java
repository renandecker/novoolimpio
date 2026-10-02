package br.com.sol7.olimpio.basico.unidade.dto;

import java.util.List;

/**
 * Migrado de UnidadeController.carregarPessoas (legado): pessoas disponiveis para o usuario
 * logado e quais delas ja estao vinculadas a unidade.
 */
public record UnidadePessoasResponse(List<Long> pessoas, List<Long> pessoasMarcadas) {
}