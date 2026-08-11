package br.com.sol7.olimpio.asaas.assinaturas;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Assinaturas" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface AssinaturasAsaasClient {


    // Criar nova assinatura (POST /v3/subscriptions)
    @POST
    @Path("/v3/subscriptions")
    Uni<JsonNode> criarNovaAssinatura(JsonNode body);


    // Listar assinaturas (GET /v3/subscriptions)
    @GET
    @Path("/v3/subscriptions")
    Uni<JsonNode> listarAssinaturas(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("customer") String customer, @QueryParam("customerGroupName") String customerGroupName, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("deletedOnly") String deletedOnly, @QueryParam("includeDeleted") String includeDeleted, @QueryParam("externalReference") String externalReference, @QueryParam("order") String order, @QueryParam("sort") String sort);


    // Criar assinatura com cartão de crédito (POST /v3/subscriptions/)
    @POST
    @Path("/v3/subscriptions/")
    Uni<JsonNode> criarAssinaturaComCartaoDeCredito(JsonNode body);


    // Recuperar uma única assinatura (GET /v3/subscriptions/:id)
    @GET
    @Path("/v3/subscriptions/{id}")
    Uni<JsonNode> recuperarUmaUnicaAssinatura(@PathParam("id") String id);


    // Atualizar assinatura existente (PUT /v3/subscriptions/:id)
    @PUT
    @Path("/v3/subscriptions/{id}")
    Uni<JsonNode> atualizarAssinaturaExistente(@PathParam("id") String id, JsonNode body);


    // Remover assinatura (DELETE /v3/subscriptions/:id)
    @DELETE
    @Path("/v3/subscriptions/{id}")
    Uni<JsonNode> removerAssinatura(@PathParam("id") String id);


    // Listar cobranças de uma assinatura (GET /v3/subscriptions/:id/payments)
    @GET
    @Path("/v3/subscriptions/{id}/payments")
    Uni<JsonNode> listarCobrancasDeUmaAssinatura(@PathParam("id") String id, @QueryParam("status") String status);


    // Gerar carnê de assinatura (GET /v3/subscriptions/:id/paymentBook)
    @GET
    @Path("/v3/subscriptions/{id}/paymentBook")
    Uni<JsonNode> gerarCarneDeAssinatura(@PathParam("id") String id, @QueryParam("month") String month, @QueryParam("year") String year, @QueryParam("sort") String sort, @QueryParam("order") String order);


    // Criar configuração para emissão de Notas Fiscais (POST /v3/subscriptions/:id/invoiceSettings)
    @POST
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    Uni<JsonNode> criarConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id, JsonNode body);


    // Recuperar configuração para emissão de notas fiscais (GET /v3/subscriptions/:id/invoiceSettings)
    @GET
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    Uni<JsonNode> recuperarConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id);


    // Remover configuração para emissão de Notas Fiscais (DELETE /v3/subscriptions/:id/invoiceSettings)
    @DELETE
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    Uni<JsonNode> removerConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id);


    // Atualizar configuração para emissão de Notas Fiscais (PUT /v3/subscriptions/:id/invoiceSettings)
    @PUT
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    Uni<JsonNode> atualizarConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id, JsonNode body);


    // Listar notas fiscais das cobranças de uma assinatura (GET /v3/subscriptions/:id/invoices)
    @GET
    @Path("/v3/subscriptions/{id}/invoices")
    Uni<JsonNode> listarNotasFiscaisDasCobrancasDeUmaAssinatura(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("effectiveDate[ge]") String effectiveDate_ge_, @QueryParam("effectiveDate[le]") String effectiveDate_le_, @QueryParam("externalReference") String externalReference, @QueryParam("status") String status, @QueryParam("customer") String customer);

}
