package br.com.sol7.olimpio.asaas.notificacoes;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Notificações". So repassa para a API do Asaas (via
 * NotificacoesAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificacoesController {

    @Inject
    @RestClient
    NotificacoesAsaasClient client;


    @PUT
    @Path("/v3/notifications/{id}")
    public Uni<JsonNode> atualizarNotificacaoExistente(@PathParam("id") String id, JsonNode body) {
        return client.atualizarNotificacaoExistente(id, body);
    }

    @PUT
    @Path("/v3/notifications/batch")
    public Uni<JsonNode> atualizarNotificacoesExistentesEmLote(JsonNode body) {
        return client.atualizarNotificacoesExistentesEmLote(body);
    }
}
