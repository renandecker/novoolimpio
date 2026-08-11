package br.com.sol7.olimpio.asaas.cobrancas;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Cobranças" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface CobrancasAsaasClient {


    // Criar nova cobrança (POST /v3/payments)
    @POST
    @Path("/v3/payments")
    Uni<JsonNode> criarNovaCobranca(JsonNode body);


    // Listar cobranças (GET /v3/payments)
    @GET
    @Path("/v3/payments")
    Uni<JsonNode> listarCobrancas(@QueryParam("installment") String installment, @QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("customer") String customer, @QueryParam("customerGroupName") String customerGroupName, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("subscription") String subscription, @QueryParam("externalReference") String externalReference, @QueryParam("paymentDate") String paymentDate, @QueryParam("invoiceStatus") String invoiceStatus, @QueryParam("estimatedCreditDate") String estimatedCreditDate, @QueryParam("pixQrCodeId") String pixQrCodeId, @QueryParam("anticipated") String anticipated, @QueryParam("anticipable") String anticipable, @QueryParam("dateCreated[ge]") String dateCreated_ge_, @QueryParam("dateCreated[le]") String dateCreated_le_, @QueryParam("paymentDate[ge]") String paymentDate_ge_, @QueryParam("paymentDate[le]") String paymentDate_le_, @QueryParam("estimatedCreditDate[ge]") String estimatedCreditDate_ge_, @QueryParam("estimatedCreditDate[le]") String estimatedCreditDate_le_, @QueryParam("dueDate[ge]") String dueDate_ge_, @QueryParam("dueDate[le]") String dueDate_le_, @QueryParam("user") String user);


    // Criar cobrança com cartão de crédito (POST /v3/payments/)
    @POST
    @Path("/v3/payments/")
    Uni<JsonNode> criarCobrancaComCartaoDeCredito(JsonNode body);


    // Capturar cobrança com Pré-Autorização (POST /v3/payments/:id/captureAuthorizedPayment)
    @POST
    @Path("/v3/payments/{id}/captureAuthorizedPayment")
    Uni<JsonNode> capturarCobrancaComPreAutorizacao(@PathParam("id") String id, JsonNode body);


    // Pagar uma cobrança com cartão de crédito (POST /v3/payments/:id/payWithCreditCard)
    @POST
    @Path("/v3/payments/{id}/payWithCreditCard")
    Uni<JsonNode> pagarUmaCobrancaComCartaoDeCredito(@PathParam("id") String id, JsonNode body);


    // Recuperar informações de pagamento de uma cobrança (GET /v3/payments/:id/billingInfo)
    @GET
    @Path("/v3/payments/{id}/billingInfo")
    Uni<JsonNode> recuperarInformacoesDePagamentoDeUmaCobranca(@PathParam("id") String id);


    // Informações sobre visualização da cobrança (GET /v3/payments/:id/viewingInfo)
    @GET
    @Path("/v3/payments/{id}/viewingInfo")
    Uni<JsonNode> informacoesSobreVisualizacaoDaCobranca(@PathParam("id") String id);


    // Recuperar uma única cobrança (GET /v3/payments/:id)
    @GET
    @Path("/v3/payments/{id}")
    Uni<JsonNode> recuperarUmaUnicaCobranca(@PathParam("id") String id);


    // Atualizar cobrança existente (PUT /v3/payments/:id)
    @PUT
    @Path("/v3/payments/{id}")
    Uni<JsonNode> atualizarCobrancaExistente(@PathParam("id") String id, JsonNode body);


    // Excluir cobrança (DELETE /v3/payments/:id)
    @DELETE
    @Path("/v3/payments/{id}")
    Uni<JsonNode> excluirCobranca(@PathParam("id") String id);


    // Restaurar cobrança removida (POST /v3/payments/:id/restore)
    @POST
    @Path("/v3/payments/{id}/restore")
    Uni<JsonNode> restaurarCobrancaRemovida(@PathParam("id") String id, JsonNode body);


    // Recuperar status de uma cobrança (GET /v3/payments/:id/status)
    @GET
    @Path("/v3/payments/{id}/status")
    Uni<JsonNode> recuperarStatusDeUmaCobranca(@PathParam("id") String id);


    // Estornar cobrança (POST /v3/payments/:id/refund)
    @POST
    @Path("/v3/payments/{id}/refund")
    Uni<JsonNode> estornarCobranca(@PathParam("id") String id, JsonNode body);


    // Obter linha digitável do boleto (GET /v3/payments/:id/identificationField)
    @GET
    @Path("/v3/payments/{id}/identificationField")
    Uni<JsonNode> obterLinhaDigitavelDoBoleto(@PathParam("id") String id);


    // Obter QR Code para pagamentos via Pix (GET /v3/payments/:id/pixQrCode)
    @GET
    @Path("/v3/payments/{id}/pixQrCode")
    Uni<JsonNode> obterQrCodeParaPagamentosViaPix(@PathParam("id") String id);


    // Confirmar recebimento em dinheiro (POST /v3/payments/:id/receiveInCash)
    @POST
    @Path("/v3/payments/{id}/receiveInCash")
    Uni<JsonNode> confirmarRecebimentoEmDinheiro(@PathParam("id") String id, JsonNode body);


    // Desfazer confirmação de recebimento em dinheiro (POST /v3/payments/:id/undoReceivedInCash)
    @POST
    @Path("/v3/payments/{id}/undoReceivedInCash")
    Uni<JsonNode> desfazerConfirmacaoDeRecebimentoEmDinheiro(@PathParam("id") String id, JsonNode body);


    // Simulador de vendas (POST /v3/payments/simulate)
    @POST
    @Path("/v3/payments/simulate")
    Uni<JsonNode> simuladorDeVendas(JsonNode body);


    // Recuperando limites de cobranças (GET /v3/payments/limits)
    @GET
    @Path("/v3/payments/limits")
    Uni<JsonNode> recuperandoLimitesDeCobrancas();


    // Recuperar garantia da cobrança na Conta Escrow (GET /v3/payments/:id/escrow)
    @GET
    @Path("/v3/payments/{id}/escrow")
    Uni<JsonNode> recuperarGarantiaDaCobrancaNaContaEscrow(@PathParam("id") String id);

}
