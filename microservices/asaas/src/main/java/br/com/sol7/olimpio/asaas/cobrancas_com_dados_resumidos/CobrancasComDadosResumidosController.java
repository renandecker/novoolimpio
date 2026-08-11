package br.com.sol7.olimpio.asaas.cobrancas_com_dados_resumidos;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Cobranças com dados resumidos". So repassa para a API do Asaas (via
 * CobrancasComDadosResumidosAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CobrancasComDadosResumidosController {

    @Inject
    @RestClient
    CobrancasComDadosResumidosAsaasClient client;


    @POST
    @Path("/v3/lean/payments")
    public Uni<JsonNode> criarNovaCobrancaComDadosResumidosNaResposta(JsonNode body) {
        return client.criarNovaCobrancaComDadosResumidosNaResposta(body);
    }

    @GET
    @Path("/v3/lean/payments")
    public Uni<JsonNode> listarCobrancasComDadosResumidos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("customer") String customer, @QueryParam("customerGroupName") String customerGroupName, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("subscription") String subscription, @QueryParam("installment") String installment, @QueryParam("externalReference") String externalReference, @QueryParam("paymentDate") String paymentDate, @QueryParam("invoiceStatus") String invoiceStatus, @QueryParam("estimatedCreditDate") String estimatedCreditDate, @QueryParam("pixQrCodeId") String pixQrCodeId, @QueryParam("anticipated") String anticipated, @QueryParam("anticipable") String anticipable, @QueryParam("dateCreated[ge]") String dateCreated_ge_, @QueryParam("dateCreated[le]") String dateCreated_le_, @QueryParam("paymentDate[ge]") String paymentDate_ge_, @QueryParam("paymentDate[le]") String paymentDate_le_, @QueryParam("estimatedCreditDate[ge]") String estimatedCreditDate_ge_, @QueryParam("estimatedCreditDate[le]") String estimatedCreditDate_le_, @QueryParam("dueDate[ge]") String dueDate_ge_, @QueryParam("dueDate[le]") String dueDate_le_, @QueryParam("user") String user) {
        return client.listarCobrancasComDadosResumidos(offset, limit, customer, customerGroupName, billingType, status, subscription, installment, externalReference, paymentDate, invoiceStatus, estimatedCreditDate, pixQrCodeId, anticipated, anticipable, dateCreated_ge_, dateCreated_le_, paymentDate_ge_, paymentDate_le_, estimatedCreditDate_ge_, estimatedCreditDate_le_, dueDate_ge_, dueDate_le_, user);
    }

    @POST
    @Path("/v3/lean/payments/")
    public Uni<JsonNode> criarCobrancaComCartaoDeCreditoComDadosResumidosNaResposta(JsonNode body) {
        return client.criarCobrancaComCartaoDeCreditoComDadosResumidosNaResposta(body);
    }

    @POST
    @Path("/v3/lean/payments/{id}/captureAuthorizedPayment")
    public Uni<JsonNode> capturarCobrancaComPreAutorizacaoComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body) {
        return client.capturarCobrancaComPreAutorizacaoComDadosResumidosNaResposta(id, body);
    }

    @GET
    @Path("/v3/lean/payments/{id}")
    public Uni<JsonNode> recuperarUmaUnicaCobrancaComDadosResumidos(@PathParam("id") String id) {
        return client.recuperarUmaUnicaCobrancaComDadosResumidos(id);
    }

    @PUT
    @Path("/v3/lean/payments/{id}")
    public Uni<JsonNode> atualizarCobrancaExistenteComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body) {
        return client.atualizarCobrancaExistenteComDadosResumidosNaResposta(id, body);
    }

    @DELETE
    @Path("/v3/lean/payments/{id}")
    public Uni<JsonNode> excluirCobrancaComDadosResumidos(@PathParam("id") String id) {
        return client.excluirCobrancaComDadosResumidos(id);
    }

    @POST
    @Path("/v3/lean/payments/{id}/restore")
    public Uni<JsonNode> restaurarCobrancaRemovidaComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body) {
        return client.restaurarCobrancaRemovidaComDadosResumidosNaResposta(id, body);
    }

    @POST
    @Path("/v3/lean/payments/{id}/refund")
    public Uni<JsonNode> estornarCobrancaComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body) {
        return client.estornarCobrancaComDadosResumidosNaResposta(id, body);
    }

    @POST
    @Path("/v3/lean/payments/{id}/receiveInCash")
    public Uni<JsonNode> confirmarRecebimentoEmDinheiroComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body) {
        return client.confirmarRecebimentoEmDinheiroComDadosResumidosNaResposta(id, body);
    }

    @POST
    @Path("/v3/lean/payments/{id}/undoReceivedInCash")
    public Uni<JsonNode> desfazerConfirmacaoDeRecebimentoEmDinheiroComDadosResumidosNaResposta(@PathParam("id") String id, JsonNode body) {
        return client.desfazerConfirmacaoDeRecebimentoEmDinheiroComDadosResumidosNaResposta(id, body);
    }
}
