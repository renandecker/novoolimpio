package br.com.sol7.olimpio.asaas.geral;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Geral". So repassa para a API do Asaas (via
 * GeralAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GeralController {

    @Inject
    @RestClient
    GeralAsaasClient client;


    @POST
    @Path("/v3/sandbox/payment/{id}/confirm")
    public Uni<JsonNode> apenasSandboxConfirmarOPagamento(@PathParam("id") String id, JsonNode body) {
        return client.apenasSandboxConfirmarOPagamento(id, body);
    }

    @POST
    @Path("/v3/sandbox/payment/{id}/overdue")
    public Uni<JsonNode> apenasSandboxForcarOVencimentoDeUmaCobranca(@PathParam("id") String id, JsonNode body) {
        return client.apenasSandboxForcarOVencimentoDeUmaCobranca(id, body);
    }

    @GET
    @Path("/v3/pix/tokenBucket/addressKey")
    public Uni<JsonNode> consultaDeFichasDisponiveisNoBalde() {
        return client.consultaDeFichasDisponiveisNoBalde();
    }

    @PUT
    @Path("/v3/subscriptions/{id}/creditCard")
    public Uni<JsonNode> atualizaOCartaoDeCreditoSemEfetuarCobranca(@PathParam("id") String id, JsonNode body) {
        return client.atualizaOCartaoDeCreditoSemEfetuarCobranca(id, body);
    }

    @POST
    @Path("/v3/checkouts")
    public Uni<JsonNode> criarNovoCheckout(JsonNode body) {
        return client.criarNovoCheckout(body);
    }

    @POST
    @Path("/v3/checkouts/{id}/cancel")
    public Uni<JsonNode> cancelarUmCheckout(@PathParam("id") String id, JsonNode body) {
        return client.cancelarUmCheckout(id, body);
    }

    @GET
    @Path("/v3/fiscalInfo/nbsCodes")
    public Uni<JsonNode> listarCodigosNbs(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("codeDescription") String codeDescription) {
        return client.listarCodigosNbs(offset, limit, codeDescription);
    }
}
