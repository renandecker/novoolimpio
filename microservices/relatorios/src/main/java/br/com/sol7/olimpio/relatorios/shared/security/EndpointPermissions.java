package br.com.sol7.olimpio.relatorios.shared.security;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Dicionario de permissoes por endpoint do modulo relatorios.
 *
 * <p>Os filtros recebem o caminho ja resolvido, com os identificadores de rota
 * substituidos pelo valor concreto. Regras especificas seriam expressoes regulares
 * ancoradas no caminho inteiro.
 *
 * <p>Regra unica, mantida inalterada para nao introduzir 403:
 * <ul>
 *   <li>GET / api/view* / *.search  -> READ</li>
 *   <li>POST na raiz do recurso (ate 3 segmentos) -> CREATE</li>
 *   <li>POST em sub-recurso (4+ segmentos)       -> UPDATE</li>
 *   <li>PUT / PATCH -> UPDATE</li>
 *   <li>DELETE -> DELETE</li>
 * </ul>
 *
 * <p>A auditoria dos botoes deste modulo nao encontrou nenhum POST cujo gate do
 * frontend divirja da regra acima, portanto nao ha excecoes. {@code extrator/remover}
 * e {@code indicador-gauge/executar} caem no padrao de sub-recurso (UPDATE) e nao
 * possui gate proprio na tela.
 */
public final class EndpointPermissions {

    private EndpointPermissions() {
    }

    private static final Pattern SEARCH = Pattern.compile(".*/search");

    public static String required(String method, String path) {
        if (path.startsWith("api/view")) return "READ";
        if (SEARCH.matcher(path).matches()) return "READ";
        return switch (method) {
            case "POST" -> path.split("/").length <= 3 ? "CREATE" : "UPDATE";
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default -> "READ";
        };
    }
}