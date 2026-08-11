package br.com.sol7.olimpio.asaas.assinaturas;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Assinaturas". So repassa para a API do Asaas (via
 * AssinaturasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssinaturasController {

    @Inject
    @RestClient
    AssinaturasAsaasClient client;


    @POST
    @Path("/v3/subscriptions")
    public Uni<JsonNode> criarNovaAssinatura(JsonNode body) {
        return client.criarNovaAssinatura(body);
    }

    @GET
    @Path("/v3/subscriptions")
    public Uni<JsonNode> listarAssinaturas(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("customer") String customer, @QueryParam("customerGroupName") String customerGroupName, @QueryParam("billingType") String billingType, @QueryParam("status") String status, @QueryParam("deletedOnly") String deletedOnly, @QueryParam("includeDeleted") String includeDeleted, @QueryParam("externalReference") String externalReference, @QueryParam("order") String order, @QueryParam("sort") String sort) {
        return client.listarAssinaturas(offset, limit, customer, customerGroupName, billingType, status, deletedOnly, includeDeleted, externalReference, order, sort);
    }

    @POST
    @Path("/v3/subscriptions/")
    public Uni<JsonNode> criarAssinaturaComCartaoDeCredito(JsonNode body) {
        return client.criarAssinaturaComCartaoDeCredito(body);
    }

    @GET
    @Path("/v3/subscriptions/{id}")
    public Uni<JsonNode> recuperarUmaUnicaAssinatura(@PathParam("id") String id) {
        return client.recuperarUmaUnicaAssinatura(id);
    }

    @PUT
    @Path("/v3/subscriptions/{id}")
    public Uni<JsonNode> atualizarAssinaturaExistente(@PathParam("id") String id, JsonNode body) {
        return client.atualizarAssinaturaExistente(id, body);
    }

    @DELETE
    @Path("/v3/subscriptions/{id}")
    public Uni<JsonNode> removerAssinatura(@PathParam("id") String id) {
        return client.removerAssinatura(id);
    }

    @GET
    @Path("/v3/subscriptions/{id}/payments")
    public Uni<JsonNode> listarCobrancasDeUmaAssinatura(@PathParam("id") String id, @QueryParam("status") String status) {
        return client.listarCobrancasDeUmaAssinatura(id, status);
    }

    @GET
    @Path("/v3/subscriptions/{id}/paymentBook")
    public Uni<JsonNode> gerarCarneDeAssinatura(@PathParam("id") String id, @QueryParam("month") String month, @QueryParam("year") String year, @QueryParam("sort") String sort, @QueryParam("order") String order) {
        return client.gerarCarneDeAssinatura(id, month, year, sort, order);
    }

    @POST
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    public Uni<JsonNode> criarConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id, JsonNode body) {
        return client.criarConfiguracaoParaEmissaoDeNotasFiscais(id, body);
    }

    @GET
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    public Uni<JsonNode> recuperarConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id) {
        return client.recuperarConfiguracaoParaEmissaoDeNotasFiscais(id);
    }

    @DELETE
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    public Uni<JsonNode> removerConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id) {
        return client.removerConfiguracaoParaEmissaoDeNotasFiscais(id);
    }

    @PUT
    @Path("/v3/subscriptions/{id}/invoiceSettings")
    public Uni<JsonNode> atualizarConfiguracaoParaEmissaoDeNotasFiscais(@PathParam("id") String id, JsonNode body) {
        return client.atualizarConfiguracaoParaEmissaoDeNotasFiscais(id, body);
    }

    @GET
    @Path("/v3/subscriptions/{id}/invoices")
    public Uni<JsonNode> listarNotasFiscaisDasCobrancasDeUmaAssinatura(@PathParam("id") String id, @QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("effectiveDate[ge]") String effectiveDate_ge_, @QueryParam("effectiveDate[le]") String effectiveDate_le_, @QueryParam("externalReference") String externalReference, @QueryParam("status") String status, @QueryParam("customer") String customer) {
        return client.listarNotasFiscaisDasCobrancasDeUmaAssinatura(id, offset, limit, effectiveDate_ge_, effectiveDate_le_, externalReference, status, customer);
    }
}
