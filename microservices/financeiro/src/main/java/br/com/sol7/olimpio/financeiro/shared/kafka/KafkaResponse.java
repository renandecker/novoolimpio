package br.com.sol7.olimpio.financeiro.shared.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class KafkaResponse {

    private String correlationId;
    private String service;
    private String action;
    private boolean success;
    private String error;
    private ObjectNode data;

    public KafkaResponse() {
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public ObjectNode getData() {
        return data;
    }

    public void setData(ObjectNode data) {
        this.data = data;
    }

    @SuppressWarnings("unchecked")
    public <T> T getData(Class<T> clazz) {
        if (data == null) {
            return null;
        }
        ObjectMapper mapper = new ObjectMapper();
        return mapper.convertValue(data, clazz);
    }

    public List<Long> getIdList() {
        if (data == null || !data.has("ids")) {
            return Collections.emptyList();
        }
        JsonNode idsNode = data.get("ids");
        if (!idsNode.isArray()) {
            return Collections.emptyList();
        }
        ObjectMapper mapper = new ObjectMapper();
        return mapper.convertValue(idsNode, mapper.getTypeFactory().constructCollectionType(List.class, Long.class));
    }

    public static KafkaResponse success(String correlationId, String service, String action, ObjectNode data) {
        KafkaResponse response = new KafkaResponse();
        response.setCorrelationId(correlationId);
        response.setService(service);
        response.setAction(action);
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    public static KafkaResponse error(String correlationId, String service, String action, String error) {
        KafkaResponse response = new KafkaResponse();
        response.setCorrelationId(correlationId);
        response.setService(service);
        response.setAction(action);
        response.setSuccess(false);
        response.setError(error);
        return response;
    }
}