package br.com.sol7.olimpio.educacao.shared.security;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Dicionario de permissoes por endpoint do modulo educacao.
 *
 * <p>Os filtros recebem o caminho ja resolvido, com os identificadores de rota
 * substituidos pelo valor concreto (ex.: {@code .../turmas/7/caderno/salvar}).
 * Por isso as regras usam expressoes regulares ancoradas no caminho inteiro, e nao
 * uma comparacao de string nem contagem de segmentos.
 *
 * <p>Regra geral quando nenhuma regra casa (verbos REST usuais, mantida inalterada
 * para nao introduzir 403):
 * <ul>
 *   <li>GET / api/view* / *.search  -> READ</li>
 *   <li>POST na raiz do recurso (ate 3 segmentos) -> CREATE</li>
 *   <li>POST em sub-recurso (4+ segmentos)       -> UPDATE</li>
 *   <li>PUT / PATCH -> UPDATE</li>
 *   <li>DELETE -> DELETE</li>
 * </ul>
 *
 * <p>As regras abaixo existem porque o POST these endpoints nao segue a semantica do
 * verbo: o gate real esta no botao do frontend e diverge do padrao.
 */
public final class EndpointPermissions {

    private EndpointPermissions() {
    }

    /**
     * Regras especificas para POST, na ordem de precedencia.
     * Cada entrada foi conferida contra o gate do botao que dispara a chamada.
     */
    private static final Map<Pattern, String> POST_RULES = postRules(
            // Tela professor: botoes que geram a chamada assinada usam permission:'READ'.
            rule("api/educacao/chamada-assinada-impressa/gerar-chamada-assinada-paisagem", "READ"),
            rule("api/educacao/chamada-assinada-impressa/gerar-chamada-assinada-retrato", "READ"),
            // Tela ligacao NAP: menus Ligacao e E-mail usam permission:'EXECUTE'.
            rule("api/educacao/nap/lote/ligacao", "EXECUTE"),
            rule("api/educacao/nap/lote/email", "EXECUTE"),
            // Tela gestao do aluno: menu "Relatorios" (acessoRelatorios) exige EXECUTE.
            rule("api/educacao/gestao-aluno/gerar-contrato", "EXECUTE"),
            rule("api/educacao/gestao-aluno/gerar-promissoria", "EXECUTE"),
            rule("api/educacao/gerar-certificado/gerar-certificado", "EXECUTE"),
            // Carregamentos que o frontend trata como leitura.
            rule("api/educacao/ligacao-nap/carregar-detalhes", "READ"),
            rule("api/educacao/digitalizacao/carregarDiasAula", "READ"),
            rule("api/educacao/digitalizacao/carregarOcorrencia", "READ"),
            rule("api/educacao/maintenance/carregar-chamadas-pendentes", "READ"),
            rule("api/educacao/chamada-assinada-impressa/carregar-chamadas-pendentes-automatico", "READ")
    );

    private static final Pattern SEARCH = Pattern.compile(".*/search");

    public static String required(String method, String path) {
        if (path.startsWith("api/view")) return "READ";
        if (SEARCH.matcher(path).matches()) return "READ";
        return switch (method) {
            case "POST" -> post(path);
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default -> "READ";
        };
    }

    private static String post(String path) {
        for (Map.Entry<Pattern, String> entry : POST_RULES.entrySet()) {
            if (entry.getKey().matcher(path).matches()) return entry.getValue();
        }
        return path.split("/").length <= 3 ? "CREATE" : "UPDATE";
    }

    private static Map.Entry<Pattern, String> rule(String path, String permission) {
        return Map.entry(Pattern.compile(Pattern.quote(path)), permission);
    }

    @SafeVarargs
    private static Map<Pattern, String> postRules(Map.Entry<Pattern, String>... entries) {
        Map<Pattern, String> rules = new LinkedHashMap<>();
        for (Map.Entry<Pattern, String> entry : entries) rules.put(entry.getKey(), entry.getValue());
        return Collections.unmodifiableMap(rules);
    }
}