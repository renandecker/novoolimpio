package br.com.sol7.olimpio.asaas;

import br.com.sol7.olimpio.shared.PagedResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Converte as respostas paginadas da API do Asaas ({@code {data, totalCount, limit, offset}})
 * para o formato PagedResponse usado pelas telas React (DataTable), e limpa campos
 * internos do app (nome/id) antes de repassar o body para a API do Asaas.
 */
@ApplicationScoped
public class AsaasProxySupport {

    @Inject
    ObjectMapper mapper;

    @SuppressWarnings("unchecked")
    public PagedResponse<Map<String, Object>> toPaged(JsonNode asaasResponse, int page, int size) {
        List<Map<String, Object>> content = new ArrayList<>();
        JsonNode data = asaasResponse != null ? asaasResponse.get("data") : null;
        if (data != null && data.isArray()) {
            for (JsonNode node : data) {
                if (node != null) content.add(mapper.convertValue(node, Map.class));
            }
        }
        long total = asaasResponse != null && asaasResponse.has("totalCount") ? asaasResponse.get("totalCount").asLong() : content.size();
        return new PagedResponse<>(content, total, page, size);
    }

    public JsonNode cleanBody(JsonNode body) {
        if (!(body instanceof ObjectNode obj))return body;
        obj.remove("nome");
        obj.remove("id");
        return obj;
    }
}
