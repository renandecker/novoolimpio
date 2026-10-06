package br.com.sol7.olimpio.shared.security;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Dicionario de permissoes por endpoint do modulo financeiro.
 *
 * <p>Os filtros recebem o caminho ja resolvido, com os identificadores de rota
 * substituidos pelo valor concreto. As regras usam expressoes regulares ancoradas
 * no caminho inteiro.
 *
 * <p>Regra geral quando nenhuma regra casa (verbos REST usuais, mantida inalterada
 * para nao introduzir 403):
 * <ul>
 *   <li>GET / api/view* / *.search  -> READ</li>
 *   <li>POST -> CREATE</li>
 *   <li>PUT / PATCH -> UPDATE</li>
 *   <li>DELETE -> DELETE</li>
 * </ul>
 *
 * <p>As excecoes sao os POSTs que geram documentos. Na tela de gestao do aluno eles
 * ficam no menu "Relatorios", exibido sob {@code acessoRelatorios}, que o frontend
 * resolve como {@code can('EXECUTE', outcome) || perfilModulo.relatorio}.
 */
public final class EndpointPermissions {

    private EndpointPermissions() {
    }

    /** Regras especificas para POST, na ordem de precedencia. */
    private static final Map<Pattern, String> POST_RULES = postRules(
            rule("api/financeiro/gerar-carne/gerar-via-documento-cancelamento-contratual", "EXECUTE"),
            rule("api/financeiro/gerar-carne/imprimir-historico", "EXECUTE"),
            rule("api/financeiro/gerar-carne/imprimir-boletim-teste", "EXECUTE")
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
        return "CREATE";
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