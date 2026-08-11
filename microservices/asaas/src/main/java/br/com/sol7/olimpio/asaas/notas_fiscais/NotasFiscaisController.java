package br.com.sol7.olimpio.asaas.notas_fiscais;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Notas fiscais". So repassa para a API do Asaas (via
 * NotasFiscaisAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotasFiscaisController {

    @Inject
    @RestClient
    NotasFiscaisAsaasClient client;


    @POST
    @Path("/v3/invoices")
    public Uni<JsonNode> agendarNotaFiscal(JsonNode body) {
        return client.agendarNotaFiscal(body);
    }

    @GET
    @Path("/v3/invoices")
    public Uni<JsonNode> listarNotasFiscais(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("effectiveDate[Ge]") String effectiveDate_Ge_, @QueryParam("effectiveDate[Le]") String effectiveDate_Le_, @QueryParam("payment") String payment, @QueryParam("installment") String installment, @QueryParam("externalReference") String externalReference, @QueryParam("status") String status, @QueryParam("customer") String customer) {
        return client.listarNotasFiscais(offset, limit, effectiveDate_Ge_, effectiveDate_Le_, payment, installment, externalReference, status, customer);
    }

    @PUT
    @Path("/v3/invoices/{id}")
    public Uni<JsonNode> atualizarNotaFiscal(@PathParam("id") String id, JsonNode body) {
        return client.atualizarNotaFiscal(id, body);
    }

    @GET
    @Path("/v3/invoices/{id}")
    public Uni<JsonNode> recuperarUmaUnicaNotaFiscal(@PathParam("id") String id) {
        return client.recuperarUmaUnicaNotaFiscal(id);
    }

    @POST
    @Path("/v3/invoices/{id}/authorize")
    public Uni<JsonNode> emitirUmaNotaFiscal(@PathParam("id") String id, JsonNode body) {
        return client.emitirUmaNotaFiscal(id, body);
    }

    @POST
    @Path("/v3/invoices/{id}/cancel")
    public Uni<JsonNode> cancelarUmaNotaFiscal(@PathParam("id") String id, JsonNode body) {
        return client.cancelarUmaNotaFiscal(id, body);
    }
}
