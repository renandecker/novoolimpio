package br.com.sol7.olimpio.relatorios.shared;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Constrói o fragmento WHERE a partir dos filtros vindos do frontend.
 * Cada entrada do mapa tem o NOME do rel_filtro como chave e
 * { operation, value [, value2] } como valor. Filtros fixos (FIXO)
 * usam { selected: true } e aplicam a operação/valor configurados em rel_filtro.
 */
public final class FiltroSqlBuilder {

    private FiltroSqlBuilder() {
    }

    public static String montarFiltroSql(List<?> configFiltros, Map<String, Object> filtros) {
        if (filtros == null || filtros.isEmpty()) return "";
        Map<String, Object[]> porNome = new HashMap<>();
        for (Object item : configFiltros) {
            Object[] cfg = (Object[]) item;
            String nome = texto(cfg[0]);
            if (!nome.isEmpty()) porNome.put(nome.trim().toLowerCase(), cfg);
        }
        List<String> condicoes = new ArrayList<>();
        for (Map.Entry<String, Object> entrada : filtros.entrySet()) {
            Object condicaoObj = entrada.getValue();
            if (!(condicaoObj instanceof Map<?, ?>)) continue;
            Map<?, ?> cond = (Map<?, ?>) condicaoObj;
            Object[] cfg = porNome.get(entrada.getKey().trim().toLowerCase());
            if (cfg == null) continue;
            String coluna = semAlias(texto(cfg[1]));
            if (coluna.isEmpty()) continue;
            if (Boolean.TRUE.equals(cond.get("selected"))) {
                String trechoFixo = montarCondicaoFixa(coluna, cfg);
                if (trechoFixo != null) condicoes.add(trechoFixo);
                continue;
            }
            String operador = operador(cond);
            String valor = texto(cond.get("value"));
            String valor2 = texto(cond.get("value2"));
            String tipoFiltro = texto(cfg[2]);
            String trecho = montarCondicao(coluna, operador, valor, valor2, tipoFiltro);
            if (trecho != null) condicoes.add(trecho);
        }
        return String.join(" AND ", condicoes);
    }

    private static String montarCondicaoFixa(String coluna, Object[] cfg) {
        String operacao = texto(cfg[3]);
        if (operacao.isBlank()) operacao = "=";
        String valorFixo = texto(cfg[7]);
        if (valorFixo.isEmpty()) return null;
        return coluna + " " + operacao + " '" + esc(valorFixo) + "'";
    }

    private static String operador(Map<?, ?> cond) {
        Object op = cond.get("operation");
        if (op == null) op = cond.get("operator");
        return op == null ? "" : op.toString();
    }

    private static String montarCondicao(String coluna, String operador, String valor, String valor2, String tipoFiltro) {
        if (operador == null || operador.isBlank() || valor == null) return null;
        String op = normalizarOperador(operador);
        if (op == null) return null;
        String dinamico = periodoDinamico(op, coluna, valor);
        if (dinamico != null) return dinamico;
        if ("BETWEEN".equals(op)) {
            if (valor.isBlank() || valor2 == null || valor2.isBlank()) return null;
            return "cast(" + coluna + " as date) BETWEEN '" + esc(valor) + "' AND '" + esc(valor2) + "'";
        }
        if ("IN".equals(op)) {
            return coluna + " IN (" + listaValores(valor) + ")";
        }
        String pattern = patternIlike(op, valor);
        if (pattern != null) return coluna + " ILIKE '" + esc(pattern) + "'";
        boolean tempo = "NORMAL".equalsIgnoreCase(tipoFiltro) || "FAIXA".equalsIgnoreCase(tipoFiltro) || "PERIODICO".equalsIgnoreCase(tipoFiltro);
        if (tempo) return "cast(" + coluna + " as date) " + op + " '" + esc(valor) + "'";
        return coluna + " " + op + " '" + esc(valor) + "'";
    }

    private static String periodoDinamico(String op, String coluna, String valor) {
        if (!"=".equals(op)) return null;
        String v = valor.trim().toUpperCase();
        return switch (v) {
            case "HOJE", "DIA ATUAL" -> "cast(" + coluna + " as date) = CURRENT_DATE";
            case "ONTEM", "DIA ANTERIOR" -> "cast(" + coluna + " as date) = CURRENT_DATE - INTERVAL '1 DAY'";
            case "ULTIMA_SEMANA", "SEMANA ANTERIOR" -> "date_trunc('week', cast(" + coluna + " as date)) = date_trunc('week', CURRENT_DATE) - INTERVAL '1 week'";
            case "ULTIMO_MES", "MES ANTERIOR" -> "date_trunc('month', cast(" + coluna + " as date)) = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'";
            case "ULTIMO_ANO", "ANO ANTERIOR" -> "date_trunc('year', cast(" + coluna + " as date)) = date_trunc('year', CURRENT_DATE) - INTERVAL '1 year'";
            case "MES_ATUAL", "MES ATUAL" -> "date_trunc('month', cast(" + coluna + " as date)) = date_trunc('month', CURRENT_DATE)";
            case "ANO_ATUAL", "ANO ATUAL" -> "date_trunc('year', cast(" + coluna + " as date)) = date_trunc('year', CURRENT_DATE)";
            default -> null;
        };
    }

    private static String normalizarOperador(String operador) {
        if (operador == null) return null;
        return switch (operador.toUpperCase()) {
            case "EQUALS", "EQ", "=" -> "=";
            case "NOT_EQUALS", "NOT_EQUAL", "NE", "!=", "<>" -> "<>";
            case "GREATER_THAN", "GT", ">" -> ">";
            case "GREATER_THAN_OR_EQUAL", "GE", ">=" -> ">=";
            case "LESS_THAN", "LT", "<" -> "<";
            case "LESS_THAN_OR_EQUAL", "LE", "<=" -> "<=";
            case "BETWEEN" -> "BETWEEN";
            case "IN", "IN_LIST" -> "IN";
            case "CONTAINS" -> "CONTAINS";
            case "STARTS_WITH" -> "STARTS_WITH";
            case "ENDS_WITH" -> "ENDS_WITH";
            default -> null;
        };
    }

    private static String patternIlike(String op, String valor) {
        return switch (op) {
            case "CONTAINS" -> "%" + valor + "%";
            case "STARTS_WITH" -> valor + "%";
            case "ENDS_WITH" -> "%" + valor;
            default -> null;
        };
    }

    private static String listaValores(String valor) {
        return Arrays.stream(valor.split(",")).map(String::trim).filter(s -> !s.isEmpty())
                .map(s -> "'" + esc(s) + "'").collect(Collectors.joining(", "));
    }

    private static String esc(String v) {
        return v.replace("'", "''");
    }

    private static String texto(Object valor) {
        return valor == null ? "" : valor.toString().trim();
    }

    private static String semAlias(String coluna) {
        return coluna.replaceFirst("(?i)\\s+as\\s+.*$", "").trim();
    }
}