package br.com.sol7.olimpio.asaas.geral;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Geral" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface GeralAsaasClient {


    // (Apenas sandbox) Confirmar o pagamento (POST /v3/sandbox/payment/:id/confirm)
    @POST
    @Path("/v3/sandbox/payment/{id}/confirm")
    Uni<JsonNode> apenasSandboxConfirmarOPagamento(@PathParam("id") String id, JsonNode body);


    // (Apenas sandbox) Forçar o vencimento de uma cobrança (POST /v3/sandbox/payment/:id/overdue)
    @POST
    @Path("/v3/sandbox/payment/{id}/overdue")
    Uni<JsonNode> apenasSandboxForcarOVencimentoDeUmaCobranca(@PathParam("id") String id, JsonNode body);


    // Consulta de fichas disponíveis no balde (GET /v3/pix/tokenBucket/addressKey)
    @GET
    @Path("/v3/pix/tokenBucket/addressKey")
    Uni<JsonNode> consultaDeFichasDisponiveisNoBalde();


    // Atualiza o cartão de crédito sem efetuar cobrança (PUT /v3/subscriptions/:id/creditCard)
    @PUT
    @Path("/v3/subscriptions/{id}/creditCard")
    Uni<JsonNode> atualizaOCartaoDeCreditoSemEfetuarCobranca(@PathParam("id") String id, JsonNode body);


    // Criar novo checkout (POST /v3/checkouts)
    @POST
    @Path("/v3/checkouts")
    Uni<JsonNode> criarNovoCheckout(JsonNode body);


    // Cancelar um checkout (POST /v3/checkouts/:id/cancel)
    @POST
    @Path("/v3/checkouts/{id}/cancel")
    Uni<JsonNode> cancelarUmCheckout(@PathParam("id") String id, JsonNode body);


    // Listar códigos NBS (GET /v3/fiscalInfo/nbsCodes)
    @GET
    @Path("/v3/fiscalInfo/nbsCodes")
    Uni<JsonNode> listarCodigosNbs(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("codeDescription") String codeDescription);

}
