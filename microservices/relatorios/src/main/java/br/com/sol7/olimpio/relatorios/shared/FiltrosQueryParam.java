package br.com.sol7.olimpio.relatorios.shared;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

/**
 * Converte o parametro de query {@code filtros} (JSON) usado pelas views de relatorio
 * no mapa de condicoes consumido por {@link FiltroSqlBuilder}.
 */
public final class FiltrosQueryParam {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private FiltrosQueryParam() {
    }

    public static Map<String, Object> parse(String filtrosJson) {
        if (filtrosJson == null || filtrosJson.isBlank()) return null;
        try {
            Map<String, Object> parsed = OBJECT_MAPPER.readValue(filtrosJson, new TypeReference<Map<String, Object>>() {
            });
            return parsed == null || parsed.isEmpty() ? null : parsed;
        } catch (Exception e) {
            return null;
        }
    }
}
