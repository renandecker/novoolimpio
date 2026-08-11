package br.com.sol7.olimpio.asaas.configuracoes_de_webhooks;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Configurações de Webhooks" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ConfiguracoesDeWebhooksAsaasClient {


    // Criar novo webhook (POST /v3/webhooks)
    @POST
    @Path("/v3/webhooks")
    Uni<JsonNode> criarNovoWebhook(JsonNode body);


    // Listar webhooks (GET /v3/webhooks)
    @GET
    @Path("/v3/webhooks")
    Uni<JsonNode> listarWebhooks(@QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Recuperar um único webhook (GET /v3/webhooks/:id)
    @GET
    @Path("/v3/webhooks/{id}")
    Uni<JsonNode> recuperarUmUnicoWebhook(@PathParam("id") String id);


    // Atualizar webhook existente (PUT /v3/webhooks/:id)
    @PUT
    @Path("/v3/webhooks/{id}")
    Uni<JsonNode> atualizarWebhookExistente(@PathParam("id") String id, JsonNode body);


    // Remover um webhook (DELETE /v3/webhooks/:id)
    @DELETE
    @Path("/v3/webhooks/{id}")
    Uni<JsonNode> removerUmWebhook(@PathParam("id") String id);

}
