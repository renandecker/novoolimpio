package br.com.sol7.olimpio.aluno.shared.security;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Tabela metodo + endpoint REST -> telas (outcome) que chamam esse endpoint.
 *
 * <p>Gerada por {@code scripts/gerar-mapa-outcomes.mjs} a partir do router do
 * frontend. Nao editar a mao: altere as telas e rode o script.
 *
 * <p>Serve para que o filtro aplique tambem as permissoes por tela do token
 * ({@code modulePermissions}), e nao apenas as permissoes globais. Um endpoint
 * pode ser chamado por mais de uma tela, porque e compartilhado; nesse caso ele
 * fica fora desta tabela e vale apenas a permissao global.
 *
 * <p>O prefixo mais especifico vence, de modo que
 * {@code api/educacao/turma/12/caderno} resolve por "api/educacao/turma/caderno"
 * antes de cair em "api/educacao/turma".
 */
public final class OutcomeRoutes {

    private OutcomeRoutes() {
    }

    private static final Map<String, List<String>> ENDPOINTS = endpoints(
            entry("GET", "api/aluno/gestao/matriculas-por-contrato", "view/gestaoAluno/gestaoAluno")
    );

    /**
     * @return as telas que chamam este endpoint com este metodo, ou lista vazia
     *         quando o caminho nao corresponde a nenhum endpoint mapeado.
     */
    public static List<String> outcomesOf(String metodo, String path) {
        String melhorPrefixo = null;
        List<String> resultado = List.of();
        for (Map.Entry<String, List<String>> e : ENDPOINTS.entrySet()) {
            String[] partes = e.getKey().split(" ", 2);
            // o metodo separa a tela que so le do POST de outra tela: sem isso, a
            // tela que apenas lista o recurso ganharia permissao de escrita nele
            if (!partes[0].equals(metodo)) continue;
            String prefixo = partes[1];
            if (!prefixo.equals(path) && !path.startsWith(prefixo + "/")) continue;
            if (melhorPrefixo != null && prefixo.length() < melhorPrefixo.length()) continue;
            if (melhorPrefixo != null && prefixo.length() == melhorPrefixo.length()) {
                List<String> juncao = new ArrayList<>(resultado);
                for (String outcome : e.getValue()) {
                    if (!juncao.contains(outcome)) juncao.add(outcome);
                }
                resultado = juncao;
            } else {
                melhorPrefixo = prefixo;
                resultado = e.getValue();
            }
        }
        return resultado;
    }

    private static Map.Entry<String, List<String>> entry(String metodo, String prefixo, String outcome) {
        return Map.entry(metodo + " " + prefixo, List.of(outcome));
    }

    @SafeVarargs
    private static Map<String, List<String>> endpoints(Map.Entry<String, List<String>>... entradas) {
        Map<String, List<String>> mapa = new java.util.LinkedHashMap<>();
        for (Map.Entry<String, List<String>> e : entradas) mapa.put(e.getKey(), e.getValue());
        return java.util.Collections.unmodifiableMap(mapa);
    }
}
