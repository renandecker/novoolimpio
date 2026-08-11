package br.com.sol7.olimpio.asaas.pix_recorrente;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Pix Recorrente" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface PixRecorrenteAsaasClient {


    // Listar recorrências (GET /v3/pix/transactions/recurrings)
    @GET
    @Path("/v3/pix/transactions/recurrings")
    Uni<JsonNode> listarRecorrencias(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("value") String value, @QueryParam("searchText") String searchText);


    // Recuperar uma única recorrência (GET /v3/pix/transactions/recurrings/:id)
    @GET
    @Path("/v3/pix/transactions/recurrings/{id}")
    Uni<JsonNode> recuperarUmaUnicaRecorrencia(@PathParam("id") String id);


    // Cancelar uma recorrência (POST /v3/pix/transactions/recurrings/:id/cancel)
    @POST
    @Path("/v3/pix/transactions/recurrings/{id}/cancel")
    Uni<JsonNode> cancelarUmaRecorrencia(@PathParam("id") String id, JsonNode body);


    // Listar itens de uma recorrência (GET /v3/pix/transactions/recurrings/:id/items)
    @GET
    @Path("/v3/pix/transactions/recurrings/{id}/items")
    Uni<JsonNode> listarItensDeUmaRecorrencia(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Cancelar item de uma recorrência (POST /v3/pix/transactions/recurrings/items/:id/cancel)
    @POST
    @Path("/v3/pix/transactions/recurrings/items/{id}/cancel")
    Uni<JsonNode> cancelarItemDeUmaRecorrencia(@PathParam("id") String id, JsonNode body);

}
