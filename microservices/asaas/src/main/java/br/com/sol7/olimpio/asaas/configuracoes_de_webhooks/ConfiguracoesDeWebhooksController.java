package br.com.sol7.olimpio.asaas.configuracoes_de_webhooks;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Configurações de Webhooks". So repassa para a API do Asaas (via
 * ConfiguracoesDeWebhooksAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ConfiguracoesDeWebhooksController {

    @Inject
    @RestClient
    ConfiguracoesDeWebhooksAsaasClient client;


    @POST
    @Path("/v3/webhooks")
    public Uni<JsonNode> criarNovoWebhook(JsonNode body) {
        return client.criarNovoWebhook(body);
    }

    @GET
    @Path("/v3/webhooks")
    public Uni<JsonNode> listarWebhooks(@QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarWebhooks(offset, limit);
    }

    @GET
    @Path("/v3/webhooks/{id}")
    public Uni<JsonNode> recuperarUmUnicoWebhook(@PathParam("id") String id) {
        return client.recuperarUmUnicoWebhook(id);
    }

    @PUT
    @Path("/v3/webhooks/{id}")
    public Uni<JsonNode> atualizarWebhookExistente(@PathParam("id") String id, JsonNode body) {
        return client.atualizarWebhookExistente(id, body);
    }

    @DELETE
    @Path("/v3/webhooks/{id}")
    public Uni<JsonNode> removerUmWebhook(@PathParam("id") String id) {
        return client.removerUmWebhook(id);
    }
}
