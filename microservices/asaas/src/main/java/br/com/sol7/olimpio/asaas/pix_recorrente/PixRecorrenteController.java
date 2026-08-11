package br.com.sol7.olimpio.asaas.pix_recorrente;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Pix Recorrente". So repassa para a API do Asaas (via
 * PixRecorrenteAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PixRecorrenteController {

    @Inject
    @RestClient
    PixRecorrenteAsaasClient client;


    @GET
    @Path("/v3/pix/transactions/recurrings")
    public Uni<JsonNode> listarRecorrencias(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("value") String value, @QueryParam("searchText") String searchText) {
        return client.listarRecorrencias(offset, limit, status, value, searchText);
    }

    @GET
    @Path("/v3/pix/transactions/recurrings/{id}")
    public Uni<JsonNode> recuperarUmaUnicaRecorrencia(@PathParam("id") String id) {
        return client.recuperarUmaUnicaRecorrencia(id);
    }

    @POST
    @Path("/v3/pix/transactions/recurrings/{id}/cancel")
    public Uni<JsonNode> cancelarUmaRecorrencia(@PathParam("id") String id, JsonNode body) {
        return client.cancelarUmaRecorrencia(id, body);
    }

    @GET
    @Path("/v3/pix/transactions/recurrings/{id}/items")
    public Uni<JsonNode> listarItensDeUmaRecorrencia(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarItensDeUmaRecorrencia(id, offset, limit);
    }

    @POST
    @Path("/v3/pix/transactions/recurrings/items/{id}/cancel")
    public Uni<JsonNode> cancelarItemDeUmaRecorrencia(@PathParam("id") String id, JsonNode body) {
        return client.cancelarItemDeUmaRecorrencia(id, body);
    }
}
