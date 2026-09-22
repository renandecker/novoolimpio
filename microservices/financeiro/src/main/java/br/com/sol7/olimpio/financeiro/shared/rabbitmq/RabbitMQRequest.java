package br.com.sol7.olimpio.financeiro.shared.rabbitmq;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Map;
import java.util.UUID;

public class RabbitMQRequest {

    private String correlationId;
    private String service;
    private String action;
    private ObjectNode params;

    public RabbitMQRequest() {
        this.correlationId = UUID.randomUUID().toString();
    }

    public RabbitMQRequest(String service, String action, Map<String, Object> params) {
        this();
        this.service = service;
        this.action = action;
        this.params = convertToJsonNode(params);
    }

    private ObjectNode convertToJsonNode(Map<String, Object> params) {
        if (params == null) {
            return null;
        }
        ObjectMapper mapper = new ObjectMapper();
        return mapper.convertValue(params, ObjectNode.class);
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

    public ObjectNode getParams() {
        return params;
    }

    public void setParams(ObjectNode params) {
        this.params = params;
    }

    public JsonNode getParam(String key) {
        if (params == null) {
            return null;
        }
        return params.get(key);
    }

    public static RabbitMQRequest of(String service, String action, Map<String, Object> params) {
        return new RabbitMQRequest(service, action, params);
    }
}