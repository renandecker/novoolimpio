package br.com.sol7.olimpio.basico.shared.security;

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
            entry("GET", "api/basico/agenda/all", "view/ligacao/ligacao"),
            entry("GET", "api/basico/bairro/opcoes", "view/logradouro/formLogradouro"),
            entry("GET", "api/basico/cidade/opcoes", "view/logradouro/formLogradouro"),
            entry("GET", "api/basico/configuracao-email", "view/estrutura/formEstrutura"),
            entry("GET", "api/basico/disponibilidade-pessoa/opcoes-pessoas", "view/pessoa/listDisponibilidadePessoa"),
            entry("GET", "api/basico/disponibilidade-pessoa/schedule-events", "view/pessoa/listDisponibilidadePessoa"),
            entry("GET", "api/basico/escolaridade/auto-complete", "view/pessoa/formPessoaFisica"),
            entry("GET", "api/basico/estado", "view/logradouro/formLogradouro"),
            entry("GET", "api/basico/estado-civil/auto-complete", "view/pessoa/formPessoaFisica"),
            entry("GET", "api/basico/estado/opcoes", "view/logradouro/formLogradouro"),
            entry("GET", "api/basico/feriado/ajustes", "view/feriado/listFeriado"),
            entry("GET", "api/basico/feriado/ajustes/paged", "view/feriado/listFeriado"),
            entry("GET", "api/basico/feriado/buscar-feriado-da-unidade-list", "view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular"),
            entry("GET", "api/basico/feriado/calendario/eventos", "view/feriado/listFeriado"),
            entry("GET", "api/basico/feriado/turmas-por-data", "view/feriado/formFeriado"),
            entry("GET", "api/basico/fornecedor", "view/fornecedor/formFornecedor"),
            entry("GET", "api/basico/funcionario/buscar-por-pessoa", "view/usuario/cadastro"),
            entry("GET", "api/basico/logradouro/auto-complete-logradouro-troca-opcoes", "view/logradouro/listLogradouro"),
            entry("GET", "api/basico/modulo/menu", "view/menu/listMapaMenu"),
            entry("GET", "api/basico/perfil", "view/perfil/formPerfil"),
            entry("GET", "api/basico/pessoa-fisica/por-pessoa", "view/usuario/formUsuario"),
            entry("GET", "api/basico/rede", "view/unidade/formRede"),
            entry("GET", "api/basico/unidade/auto-complete-unidade-usuario", "view/feriado/formFeriado"),
            entry("GET", "api/basico/usuario-logado/favoritos", "view/favoritoUsuario/listFavoritoUsuario"),
            entry("GET", "api/basico/usuario/atual", "view/pagamento/fechamentoCaixa"),
            entry("GET", "api/basico/usuario/autocomplete", "view/operacional/formOperacional"),
            entry("GET", "api/basico/usuario/buscar-agendas-disponiveis", "view/usuario/formUsuario"),
            entry("GET", "api/basico/usuario/buscar-usuario-seu-perfil", "view/usuario/formUsuario"),
            entry("POST", "api/basico/agenda", "view/agenda/formAgenda"),
            entry("POST", "api/basico/feriado", "view/feriado/formFeriado"),
            entry("POST", "api/basico/feriado/atualizar-oferecimento", "view/feriado/listFeriado"),
            entry("POST", "api/basico/feriado/trocar-feriados", "view/feriado/listFeriado"),
            entry("POST", "api/basico/fornecedor", "view/fornecedor/formFornecedor"),
            entry("POST", "api/basico/funcionario", "view/usuario/cadastro"),
            entry("POST", "api/basico/logradouro", "view/logradouro/formLogradouro"),
            entry("POST", "api/basico/logradouro/atualizar-logradouro", "view/logradouro/listLogradouro"),
            entry("POST", "api/basico/logradouro/trocar-logradouros", "view/logradouro/listLogradouro"),
            entry("POST", "api/basico/perfil", "view/perfil/formPerfil"),
            entry("POST", "api/basico/rede", "view/unidade/formRede"),
            entry("POST", "api/basico/unidade", "view/unidade/formUnidade"),
            entry("POST", "api/basico/usuario", "view/usuario/formUsuario"),
            entry("PUT", "api/basico/feriado", "view/feriado/formFeriado"),
            entry("PUT", "api/basico/fornecedor", "view/fornecedor/formFornecedor"),
            entry("PUT", "api/basico/funcionario", "view/usuario/cadastro"),
            entry("PUT", "api/basico/logradouro", "view/logradouro/formLogradouro"),
            entry("PUT", "api/basico/perfil", "view/perfil/formPerfil"),
            entry("PUT", "api/basico/rede", "view/unidade/formRede"),
            entry("PUT", "api/basico/unidade", "view/unidade/formUnidade")
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
