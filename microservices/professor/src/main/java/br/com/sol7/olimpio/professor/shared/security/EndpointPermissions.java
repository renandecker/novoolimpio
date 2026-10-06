package br.com.sol7.olimpio.professor.shared.security;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Dicionario de permissoes por endpoint do modulo professor.
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
 * <p>As tres rotas de {@code /turmas/{id}/} acaoam botoes com gates diferentes na
 * mesma tela (ViewGestaoProfessorGestaoProfessorListScreen). Sem as regras abaixo o
 * filtro exigiria UPDATE nas tres e negaria o CREATE de caderno e de registros.
 */
public final class EndpointPermissions {

    private EndpointPermissions() {
    }

    private static final String TURMA = "api/professor/gestao-professor/turmas/[^/]+/";

    /** Regras especificas para POST, na ordem de precedencia. */
    private static final Map<Pattern, String> POST_RULES = postRules(
            // Botao "Salvar" do caderno de chamada -> <PermissionGate permission="CREATE">
            rule(TURMA + "caderno/salvar", "CREATE"),
            // Botao "Salvar" dos registros de aula -> <PermissionGate permission="CREATE">
            rule(TURMA + "registros/salvar", "CREATE"),
            // Botao "Alterar" das notas -> <PermissionGate permission="UPDATE">
            rule(TURMA + "notas/salvar", "UPDATE")
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
        return Map.entry(Pattern.compile(path), permission);
    }

    @SafeVarargs
    private static Map<Pattern, String> postRules(Map.Entry<Pattern, String>... entries) {
        Map<Pattern, String> rules = new LinkedHashMap<>();
        for (Map.Entry<Pattern, String> entry : entries) rules.put(entry.getKey(), entry.getValue());
        return Collections.unmodifiableMap(rules);
    }
}