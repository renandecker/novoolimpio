package br.com.sol7.olimpio.educacao.shared.security;

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
            entry("DELETE", "api/educacao/ocorrencia-componente-curricular", "view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular"),
            entry("DELETE", "api/educacao/oferecimento-componente-curricular", "view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular"),
            entry("DELETE", "api/educacao/oferecimento-curso", "view/oferecimentoComponenteCurricular/listOferecimentoCurso"),
            entry("GET", "api/educacao/contrato/auto-complete-aluno", "view/gestaoAluno/gestaoAluno"),
            entry("GET", "api/educacao/contrato/buscar-contratos-pessoa", "view/gestaoAluno/gestaoAluno"),
            entry("GET", "api/educacao/curriculo-atividade-complementar", "view/curriculo/formCurriculo"),
            entry("GET", "api/educacao/curriculo-unidade", "view/curriculo/formCurriculo"),
            entry("GET", "api/educacao/curso", "view/curriculo/formCurriculo"),
            entry("GET", "api/educacao/forma-pagamento", "view/matricula/wizard"),
            entry("GET", "api/educacao/grupo", "view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular"),
            entry("GET", "api/educacao/matriz-curricular", "view/curriculo/formCurriculo"),
            entry("GET", "api/educacao/nap/lote", "view/nap/listLote"),
            entry("GET", "api/educacao/oferecimento-curso", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("GET", "api/educacao/oferecimento-curso/detalhe", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("GET", "api/educacao/oferecimento-grupo", "view/matricula/wizard"),
            entry("GET", "api/educacao/parcela/calcular", "view/matricula/wizard"),
            entry("GET", "api/educacao/requisito-matriz", "view/curriculo/formCurriculo"),
            entry("GET", "api/educacao/sala/buscar-salas-da-unidade", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("GET", "api/educacao/tipo-contrato", "view/professor/formProfessor"),
            entry("GET", "api/educacao/tipo-curso/opcoes", "view/feriado/formFeriado"),
            entry("GET", "api/educacao/tipo-sala", "view/componenteCurricular/formComponenteCurricular"),
            entry("GET", "api/educacao/turma", "view/turma/recriarCalendarioAcademico"),
            entry("POST", "api/educacao/chamada-assinada-impressa/gerar-chamada-assinada-paisagem", "view/chamadaAssinada/listChamadaAssinada"),
            entry("POST", "api/educacao/chamada-assinada-impressa/gerar-chamada-assinada-retrato", "view/chamadaAssinada/listChamadaAssinada"),
            entry("POST", "api/educacao/criterio", "view/criterio/formCriterio"),
            entry("POST", "api/educacao/dia-aula", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("POST", "api/educacao/grupo", "view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular"),
            entry("POST", "api/educacao/ligacao-nap/carregar-detalhes", "view/nap/listLigacaoNap"),
            entry("POST", "api/educacao/matricula", "view/matricula/wizard"),
            entry("POST", "api/educacao/nap/lote/email", "view/nap/listLigacaoNap"),
            entry("POST", "api/educacao/nap/lote/ligacao", "view/nap/listLigacaoNap"),
            entry("POST", "api/educacao/ocorrencia-componente-curricular", "view/oferecimentoComponenteCurricular/formOferecimentoComponenteCurricular"),
            entry("POST", "api/educacao/oferecimento-curso", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("POST", "api/educacao/oferecimento-curso/gerar-aula-curso-sequencia", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("POST", "api/educacao/turma", "view/turma/listTurma"),
            entry("PUT", "api/educacao/criterio", "view/criterio/formCriterio"),
            entry("PUT", "api/educacao/oferecimento-componente-curricular", "view/oferecimentoComponenteCurricular/formOferecimentoCurso"),
            entry("PUT", "api/educacao/oferecimento-curso", "view/oferecimentoComponenteCurricular/formOferecimentoCurso")
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
