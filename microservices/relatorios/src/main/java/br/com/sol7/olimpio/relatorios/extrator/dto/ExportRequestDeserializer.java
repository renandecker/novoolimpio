package br.com.sol7.olimpio.relatorios.extrator.dto;

import io.quarkus.kafka.client.serialization.ObjectMapperDeserializer;

public class ExportRequestDeserializer extends ObjectMapperDeserializer<ExportRequest> {

    public ExportRequestDeserializer() {
        super(ExportRequest.class);
    }
}