package br.com.sol7.olimpio.asaas.negativacoes;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Negativações" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface NegativacoesAsaasClient {


    // Criar uma negativação (POST /v3/paymentDunnings)
    @POST
    @Path("/v3/paymentDunnings")
    Uni<JsonNode> criarUmaNegativacao();


    // Listar negativações (GET /v3/paymentDunnings)
    @GET
    @Path("/v3/paymentDunnings")
    Uni<JsonNode> listarNegativacoes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("type") String type, @QueryParam("payment") String payment, @QueryParam("requestStartDate") String requestStartDate, @QueryParam("requestEndDate") String requestEndDate);


    // Simular uma negativação (POST /v3/paymentDunnings/simulate)
    @POST
    @Path("/v3/paymentDunnings/simulate")
    Uni<JsonNode> simularUmaNegativacao(@QueryParam("payment") String payment, JsonNode body);


    // Recuperar uma única negativação (GET /v3/paymentDunnings/:id)
    @GET
    @Path("/v3/paymentDunnings/{id}")
    Uni<JsonNode> recuperarUmaUnicaNegativacao(@PathParam("id") String id);


    // Listar histórico de eventos (GET /v3/paymentDunnings/:id/history)
    @GET
    @Path("/v3/paymentDunnings/{id}/history")
    Uni<JsonNode> listarHistoricoDeEventos(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Listar pagamentos recebidos (GET /v3/paymentDunnings/:id/partialPayments)
    @GET
    @Path("/v3/paymentDunnings/{id}/partialPayments")
    Uni<JsonNode> listarPagamentosRecebidos(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Listar cobranças disponíveis para negativação (GET /v3/paymentDunnings/paymentsAvailableForDunning)
    @GET
    @Path("/v3/paymentDunnings/paymentsAvailableForDunning")
    Uni<JsonNode> listarCobrancasDisponiveisParaNegativacao(@QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Reenviar documentos (POST /v3/paymentDunnings/:id/documents)
    @POST
    @Path("/v3/paymentDunnings/{id}/documents")
    Uni<JsonNode> reenviarDocumentos(@PathParam("id") String id);


    // Cancelar negativação (POST /v3/paymentDunnings/:id/cancel)
    @POST
    @Path("/v3/paymentDunnings/{id}/cancel")
    Uni<JsonNode> cancelarNegativacao(@PathParam("id") String id, JsonNode body);

}
