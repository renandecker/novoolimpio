package br.com.sol7.olimpio.asaas.pagamento_de_contas;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Pagamento de contas". So repassa para a API do Asaas (via
 * PagamentoDeContasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PagamentoDeContasController {

    @Inject
    @RestClient
    PagamentoDeContasAsaasClient client;


    @POST
    @Path("/v3/bill")
    public Uni<JsonNode> criarUmPagamentoDeConta(JsonNode body) {
        return client.criarUmPagamentoDeConta(body);
    }

    @GET
    @Path("/v3/bill")
    public Uni<JsonNode> listarPagamentoDeContas(@QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarPagamentoDeContas(offset, limit);
    }

    @POST
    @Path("/v3/bill/simulate")
    public Uni<JsonNode> simularUmPagamentoDeConta(JsonNode body) {
        return client.simularUmPagamentoDeConta(body);
    }

    @GET
    @Path("/v3/bill/{id}")
    public Uni<JsonNode> recuperarUmUnicoPagamentoDeConta(@PathParam("id") String id) {
        return client.recuperarUmUnicoPagamentoDeConta(id);
    }

    @POST
    @Path("/v3/bill/{id}/cancel")
    public Uni<JsonNode> cancelarPagamentoDeContas(@PathParam("id") String id, JsonNode body) {
        return client.cancelarPagamentoDeContas(id, body);
    }
}
