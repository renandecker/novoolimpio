package br.com.sol7.olimpio.asaas.cobrancas_com_dados_resumidos;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Cobranças com dados resumidos" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface CobrancasComDadosResumidosAsaasClient {


    // Criar nova cobrança com dados resumidos na resposta (POST /v3/lean/payments)
    @POST
    @Path("/v3/lean/payments")
    Uni<JsonNode> criarNovaCobrancaComDadosResumidosNaResposta(JsonNode body);


    // Listar cobranças com dados resumidos (GET /v3/lean/payments)
    @GET
    @Path("/v3/lean/payments")
    Uni<JsonNode> listarCobrancasComDadosResumidos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("customer") String customer, @QueryParam("customerGroupName") String customerGroupName, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("subscription") String subscription, @QueryParam("installment") String installment, @QueryParam("externalReference") String externalReference, @QueryParam("paymentDate") String paymentDate, @QueryParam("invoiceStatus") String invoiceStatus, @QueryParam("estimatedCreditDate") String estimatedCreditDate, @QueryParam("pixQrCodeId") String pixQrCodeId, @QueryParam("anticipated") String anticipated, @QueryParam("anticipable") String anticipable, @QueryParam("dateCreated[ge]") String dateCreated_ge_, @QueryParam("dateCreated[le]") String dateCreated_le_, @QueryParam("paymentDate[ge]") String paymentDate_ge_, @QueryParam("paymentDate[le]") String paymentDate_le_, @QueryParam("estimatedCreditDate[ge]") String estimatedCreditDate_ge_, @QueryParam("estimatedCreditDate[le]") String estimatedCreditDate_le_, @QueryParam("dueDate[ge]") String dueDate_ge_, @QueryParam("dueDate[le]") String dueDate_le_, @QueryParam("user") String user);


    // Criar cobrança com cartão de crédito com dados resumidos na resposta (POST /v3/lean/payments/)
    @POST
    @Path("/v3/lean/payments/")
    Uni<JsonNode> criarCobrancaComCartaoDeCreditoComDadosResumidosNaResposta(JsonNode body);


    // Capturar cobrança com Pré-Autorização com dados resumidos na resposta (POST /v3/lean/payments/:id/captureAuthorizedPayment)
    @POST
    @Path("/v3/lean/payments/{id}/captureAuthorizedPayment")
    Uni<JsonNode> capturarCobrancaComPreAutorizacaoComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body);


    // Recuperar uma única cobrança com dados resumidos (GET /v3/lean/payments/:id)
    @GET
    @Path("/v3/lean/payments/{id}")
    Uni<JsonNode> recuperarUmaUnicaCobrancaComDadosResumidos(@PathParam("id") String id);


    // Atualizar cobrança existente com dados resumidos na resposta (PUT /v3/lean/payments/:id)
    @PUT
    @Path("/v3/lean/payments/{id}")
    Uni<JsonNode> atualizarCobrancaExistenteComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body);


    // Excluir cobrança com dados resumidos (DELETE /v3/lean/payments/:id)
    @DELETE
    @Path("/v3/lean/payments/{id}")
    Uni<JsonNode> excluirCobrancaComDadosResumidos(@PathParam("id") String id);


    // Restaurar cobrança removida com dados resumidos na resposta (POST /v3/lean/payments/:id/restore)
    @POST
    @Path("/v3/lean/payments/{id}/restore")
    Uni<JsonNode> restaurarCobrancaRemovidaComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body);


    // Estornar cobrança com dados resumidos na resposta (POST /v3/lean/payments/:id/refund)
    @POST
    @Path("/v3/lean/payments/{id}/refund")
    Uni<JsonNode> estornarCobrancaComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body);


    // Confirmar recebimento em dinheiro com dados resumidos na resposta (POST /v3/lean/payments/:id/receiveInCash)
    @POST
    @Path("/v3/lean/payments/{id}/receiveInCash")
    Uni<JsonNode> confirmarRecebimentoEmDinheiroComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body);


    // Desfazer confirmação de recebimento em dinheiro com dados resumidos na resposta (POST /v3/lean/payments/:id/undoReceivedInCash)
    @POST
    @Path("/v3/lean/payments/{id}/undoReceivedInCash")
    Uni<JsonNode> desfazerConfirmacaoDeRecebimentoEmDinheiroComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body);

}
