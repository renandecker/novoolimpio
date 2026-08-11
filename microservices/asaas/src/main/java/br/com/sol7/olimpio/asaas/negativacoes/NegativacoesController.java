package br.com.sol7.olimpio.asaas.negativacoes;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Negativações". So repassa para a API do Asaas (via
 * NegativacoesAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NegativacoesController {

    @Inject
    @RestClient
    NegativacoesAsaasClient client;


    @POST
    @Path("/v3/paymentDunnings")
    public Uni<JsonNode> criarUmaNegativacao() {
        return client.criarUmaNegativacao();
    }

    @GET
    @Path("/v3/paymentDunnings")
    public Uni<JsonNode> listarNegativacoes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("type") String type, @QueryParam("payment") String payment, @QueryParam("requestStartDate") String requestStartDate, @QueryParam("requestEndDate") String requestEndDate) {
        return client.listarNegativacoes(offset, limit, status, type, payment, requestStartDate, requestEndDate);
    }

    @POST
    @Path("/v3/paymentDunnings/simulate")
    public Uni<JsonNode> simularUmaNegativacao(@QueryParam("payment") String payment, JsonNode body) {
        return client.simularUmaNegativacao(payment, body);
    }

    @GET
    @Path("/v3/paymentDunnings/{id}")
    public Uni<JsonNode> recuperarUmaUnicaNegativacao(@PathParam("id") String id) {
        return client.recuperarUmaUnicaNegativacao(id);
    }

    @GET
    @Path("/v3/paymentDunnings/{id}/history")
    public Uni<JsonNode> listarHistoricoDeEventos(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarHistoricoDeEventos(id, offset, limit);
    }

    @GET
    @Path("/v3/paymentDunnings/{id}/partialPayments")
    public Uni<JsonNode> listarPagamentosRecebidos(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarPagamentosRecebidos(id, offset, limit);
    }

    @GET
    @Path("/v3/paymentDunnings/paymentsAvailableForDunning")
    public Uni<JsonNode> listarCobrancasDisponiveisParaNegativacao(@QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarCobrancasDisponiveisParaNegativacao(offset, limit);
    }

    @POST
    @Path("/v3/paymentDunnings/{id}/documents")
    public Uni<JsonNode> reenviarDocumentos(@PathParam("id") String id) {
        return client.reenviarDocumentos(id);
    }

    @POST
    @Path("/v3/paymentDunnings/{id}/cancel")
    public Uni<JsonNode> cancelarNegativacao(@PathParam("id") String id, JsonNode body) {
        return client.cancelarNegativacao(id, body);
    }
}
