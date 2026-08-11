package br.com.sol7.olimpio.asaas.parcelamentos;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Parcelamentos". So repassa para a API do Asaas (via
 * ParcelamentosAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ParcelamentosController {

    @Inject
    @RestClient
    ParcelamentosAsaasClient client;


    @POST
    @Path("/v3/installments")
    public Uni<JsonNode> criarParcelamento(JsonNode body) {
        return client.criarParcelamento(body);
    }

    @GET
    @Path("/v3/installments")
    public Uni<JsonNode> listarParcelamentos(@QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarParcelamentos(offset, limit);
    }

    @POST
    @Path("/v3/installments/")
    public Uni<JsonNode> criarParcelamentoComCartaoDeCredito(JsonNode body) {
        return client.criarParcelamentoComCartaoDeCredito(body);
    }

    @GET
    @Path("/v3/installments/{id}")
    public Uni<JsonNode> recuperarUmUnicoParcelamento(@PathParam("id") String id) {
        return client.recuperarUmUnicoParcelamento(id);
    }

    @DELETE
    @Path("/v3/installments/{id}")
    public Uni<JsonNode> removerParcelamento(@PathParam("id") String id) {
        return client.removerParcelamento(id);
    }

    @GET
    @Path("/v3/installments/{id}/payments")
    public Uni<JsonNode> listarCobrancasDeUmParcelamento(@PathParam("id") String id, @QueryParam("status") String status) {
        return client.listarCobrancasDeUmParcelamento(id, status);
    }

    @GET
    @Path("/v3/installments/{id}/paymentBook")
    public Uni<JsonNode> gerarCarneDeParcelamento(@PathParam("id") String id, @QueryParam("sort") String sort, @QueryParam("order") String order) {
        return client.gerarCarneDeParcelamento(id, sort, order);
    }

    @POST
    @Path("/v3/installments/{id}/refund")
    public Uni<JsonNode> estornarParcelamento(@PathParam("id") String id, JsonNode body) {
        return client.estornarParcelamento(id, body);
    }

    @PUT
    @Path("/v3/installments/{id}/splits")
    public Uni<JsonNode> atualizarSplitsDoParcelamento(@PathParam("id") String id, JsonNode body) {
        return client.atualizarSplitsDoParcelamento(id, body);
    }
}
