package br.com.sol7.olimpio.basico.acesso.dto;

import java.util.List;

/**
 * Acesso do usuario autenticado em uma tela do menu, resolvido a partir de
 * bas_modulo (outcome) e bas_perfil_modulo (novo/editar/remover/relatorio).
 * O mapeamento para as permissoes usadas nos filtros JWT e:
 * leitura=READ, novo=CREATE, editar=UPDATE, remover=DELETE, relatorio=EXECUTE.
 */
public record VerificarAcessoResponse(
        String outcome,
        boolean admin,
        boolean conhecido,
        boolean leitura,
        boolean novo,
        boolean editar,
        boolean remover,
        boolean relatorio,
        List<String> permissoes
) {
}