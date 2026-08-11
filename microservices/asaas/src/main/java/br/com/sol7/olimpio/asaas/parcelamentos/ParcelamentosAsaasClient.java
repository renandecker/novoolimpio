package br.com.sol7.olimpio.asaas.parcelamentos;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Parcelamentos" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ParcelamentosAsaasClient {


    // Criar parcelamento (POST /v3/installments)
    @POST
    @Path("/v3/installments")
    Uni<JsonNode> criarParcelamento(JsonNode body);


    // Listar parcelamentos (GET /v3/installments)
    @GET
    @Path("/v3/installments")
    Uni<JsonNode> listarParcelamentos(@QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Criar parcelamento com cartão de crédito (POST /v3/installments/)
    @POST
    @Path("/v3/installments/")
    Uni<JsonNode> criarParcelamentoComCartaoDeCredito(JsonNode body);


    // Recuperar um único parcelamento (GET /v3/installments/:id)
    @GET
    @Path("/v3/installments/{id}")
    Uni<JsonNode> recuperarUmUnicoParcelamento(@PathParam("id") String id);


    // Remover parcelamento (DELETE /v3/installments/:id)
    @DELETE
    @Path("/v3/installments/{id}")
    Uni<JsonNode> removerParcelamento(@PathParam("id") String id);


    // Listar cobranças de um parcelamento (GET /v3/installments/:id/payments)
    @GET
    @Path("/v3/installments/{id}/payments")
    Uni<JsonNode> listarCobrancasDeUmParcelamento(@PathParam("id") String id, @QueryParam("status") String status);


    // Gerar carnê de parcelamento (GET /v3/installments/:id/paymentBook)
    @GET
    @Path("/v3/installments/{id}/paymentBook")
    Uni<JsonNode> gerarCarneDeParcelamento(@PathParam("id") String id, @QueryParam("sort") String sort, @QueryParam("order") String order);


    // Estornar parcelamento (POST /v3/installments/:id/refund)
    @POST
    @Path("/v3/installments/{id}/refund")
    Uni<JsonNode> estornarParcelamento(@PathParam("id") String id, JsonNode body);


    // Atualizar splits do parcelamento (PUT /v3/installments/:id/splits)
    @PUT
    @Path("/v3/installments/{id}/splits")
    Uni<JsonNode> atualizarSplitsDoParcelamento(@PathParam("id") String id, JsonNode body);

}
