package br.com.sol7.olimpio.asaas.cobrancas;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Cobranças". So repassa para a API do Asaas (via
 * CobrancasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CobrancasController {

    @Inject
    @RestClient
    CobrancasAsaasClient client;


    @POST
    @Path("/v3/payments")
    public Uni<JsonNode> criarNovaCobranca(JsonNode body) {
        return client.criarNovaCobranca(body);
    }

    @GET
    @Path("/v3/payments")
    public Uni<JsonNode> listarCobrancas(@QueryParam("installment") String installment, @QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("customer") String customer, @QueryParam("customerGroupName") String customerGroupName, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("subscription") String subscription, @QueryParam("externalReference") String externalReference, @QueryParam("paymentDate") String paymentDate, @QueryParam("invoiceStatus") String invoiceStatus, @QueryParam("estimatedCreditDate") String estimatedCreditDate, @QueryParam("pixQrCodeId") String pixQrCodeId, @QueryParam("anticipated") String anticipated, @QueryParam("anticipable") String anticipable, @QueryParam("dateCreated[ge]") String dateCreated_ge_, @QueryParam("dateCreated[le]") String dateCreated_le_, @QueryParam("paymentDate[ge]") String paymentDate_ge_, @QueryParam("paymentDate[le]") String paymentDate_le_, @QueryParam("estimatedCreditDate[ge]") String estimatedCreditDate_ge_, @QueryParam("estimatedCreditDate[le]") String estimatedCreditDate_le_, @QueryParam("dueDate[ge]") String dueDate_ge_, @QueryParam("dueDate[le]") String dueDate_le_, @QueryParam("user") String user) {
        return client.listarCobrancas(installment, offset, limit, customer, customerGroupName, billingType, status, subscription, externalReference, paymentDate, invoiceStatus, estimatedCreditDate, pixQrCodeId, anticipated, anticipable, dateCreated_ge_, dateCreated_le_, paymentDate_ge_, paymentDate_le_, estimatedCreditDate_ge_, estimatedCreditDate_le_, dueDate_ge_, dueDate_le_, user);
    }

    @POST
    @Path("/v3/payments/")
    public Uni<JsonNode> criarCobrancaComCartaoDeCredito(JsonNode body) {
        return client.criarCobrancaComCartaoDeCredito(body);
    }

    @POST
    @Path("/v3/payments/{id}/captureAuthorizedPayment")
    public Uni<JsonNode> capturarCobrancaComPreAutorizacao(@PathParam("id") String id, JsonNode body) {
        return client.capturarCobrancaComPreAutorizacao(id, body);
    }

    @POST
    @Path("/v3/payments/{id}/payWithCreditCard")
    public Uni<JsonNode> pagarUmaCobrancaComCartaoDeCredito(@PathParam("id") String id, JsonNode body) {
        return client.pagarUmaCobrancaComCartaoDeCredito(id, body);
    }

    @GET
    @Path("/v3/payments/{id}/billingInfo")
    public Uni<JsonNode> recuperarInformacoesDePagamentoDeUmaCobranca(@PathParam("id") String id) {
        return client.recuperarInformacoesDePagamentoDeUmaCobranca(id);
    }

    @GET
    @Path("/v3/payments/{id}/viewingInfo")
    public Uni<JsonNode> informacoesSobreVisualizacaoDaCobranca(@PathParam("id") String id) {
        return client.informacoesSobreVisualizacaoDaCobranca(id);
    }

    @GET
    @Path("/v3/payments/{id}")
    public Uni<JsonNode> recuperarUmaUnicaCobranca(@PathParam("id") String id) {
        return client.recuperarUmaUnicaCobranca(id);
    }

    @PUT
    @Path("/v3/payments/{id}")
    public Uni<JsonNode> atualizarCobrancaExistente(@PathParam("id") String id, JsonNode body) {
        return client.atualizarCobrancaExistente(id, body);
    }

    @DELETE
    @Path("/v3/payments/{id}")
    public Uni<JsonNode> excluirCobranca(@PathParam("id") String id) {
        return client.excluirCobranca(id);
    }

    @POST
    @Path("/v3/payments/{id}/restore")
    public Uni<JsonNode> restaurarCobrancaRemovida(@PathParam("id") String id, JsonNode body) {
        return client.restaurarCobrancaRemovida(id, body);
    }

    @GET
    @Path("/v3/payments/{id}/status")
    public Uni<JsonNode> recuperarStatusDeUmaCobranca(@PathParam("id") String id) {
        return client.recuperarStatusDeUmaCobranca(id);
    }

    @POST
    @Path("/v3/payments/{id}/refund")
    public Uni<JsonNode> estornarCobranca(@PathParam("id") String id, JsonNode body) {
        return client.estornarCobranca(id, body);
    }

    @GET
    @Path("/v3/payments/{id}/identificationField")
    public Uni<JsonNode> obterLinhaDigitavelDoBoleto(@PathParam("id") String id) {
        return client.obterLinhaDigitavelDoBoleto(id);
    }

    @GET
    @Path("/v3/payments/{id}/pixQrCode")
    public Uni<JsonNode> obterQrCodeParaPagamentosViaPix(@PathParam("id") String id) {
        return client.obterQrCodeParaPagamentosViaPix(id);
    }

    @POST
    @Path("/v3/payments/{id}/receiveInCash")
    public Uni<JsonNode> confirmarRecebimentoEmDinheiro(@PathParam("id") String id, JsonNode body) {
        return client.confirmarRecebimentoEmDinheiro(id, body);
    }

    @POST
    @Path("/v3/payments/{id}/undoReceivedInCash")
    public Uni<JsonNode> desfazerConfirmacaoDeRecebimentoEmDinheiro(@PathParam("id") String id, JsonNode body) {
        return client.desfazerConfirmacaoDeRecebimentoEmDinheiro(id, body);
    }

    @POST
    @Path("/v3/payments/simulate")
    public Uni<JsonNode> simuladorDeVendas(JsonNode body) {
        return client.simuladorDeVendas(body);
    }

    @GET
    @Path("/v3/payments/limits")
    public Uni<JsonNode> recuperandoLimitesDeCobrancas() {
        return client.recuperandoLimitesDeCobrancas();
    }

    @GET
    @Path("/v3/payments/{id}/escrow")
    public Uni<JsonNode> recuperarGarantiaDaCobrancaNaContaEscrow(@PathParam("id") String id) {
        return client.recuperarGarantiaDaCobrancaNaContaEscrow(id);
    }
}
