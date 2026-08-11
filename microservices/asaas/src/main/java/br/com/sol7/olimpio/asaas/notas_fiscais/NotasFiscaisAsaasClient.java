package br.com.sol7.olimpio.asaas.notas_fiscais;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Notas fiscais" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface NotasFiscaisAsaasClient {


    // Agendar nota fiscal (POST /v3/invoices)
    @POST
    @Path("/v3/invoices")
    Uni<JsonNode> agendarNotaFiscal(JsonNode body);


    // Listar notas fiscais (GET /v3/invoices)
    @GET
    @Path("/v3/invoices")
    Uni<JsonNode> listarNotasFiscais(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("effectiveDate[Ge]") String effectiveDate_Ge_, @QueryParam("effectiveDate[Le]") String effectiveDate_Le_, @QueryParam("payment") String payment, @QueryParam("installment") String installment, @QueryParam("externalReference") String externalReference, @QueryParam("status") String status, @QueryParam("customer") String customer);


    // Atualizar nota fiscal (PUT /v3/invoices/:id)
    @PUT
    @Path("/v3/invoices/{id}")
    Uni<JsonNode> atualizarNotaFiscal(@PathParam("id") String id, JsonNode body);


    // Recuperar uma única nota fiscal (GET /v3/invoices/:id)
    @GET
    @Path("/v3/invoices/{id}")
    Uni<JsonNode> recuperarUmaUnicaNotaFiscal(@PathParam("id") String id);


    // Emitir uma nota fiscal (POST /v3/invoices/:id/authorize)
    @POST
    @Path("/v3/invoices/{id}/authorize")
    Uni<JsonNode> emitirUmaNotaFiscal(@PathParam("id") String id, JsonNode body);


    // Cancelar uma nota fiscal (POST /v3/invoices/:id/cancel)
    @POST
    @Path("/v3/invoices/{id}/cancel")
    Uni<JsonNode> cancelarUmaNotaFiscal(@PathParam("id") String id, JsonNode body);

}
