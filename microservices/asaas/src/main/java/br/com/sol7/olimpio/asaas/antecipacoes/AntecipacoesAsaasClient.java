package br.com.sol7.olimpio.asaas.antecipacoes;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Antecipações" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface AntecipacoesAsaasClient {


    // Recuperar uma única antecipação (GET /v3/anticipations/:id)
    @GET
    @Path("/v3/anticipations/{id}")
    Uni<JsonNode> recuperarUmaUnicaAntecipacao(@PathParam("id") String id);


    // Solicitar antecipação (POST /v3/anticipations)
    @POST
    @Path("/v3/anticipations")
    Uni<JsonNode> solicitarAntecipacao();


    // Listar antecipações (GET /v3/anticipations)
    @GET
    @Path("/v3/anticipations")
    Uni<JsonNode> listarAntecipacoes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("payment") String payment, @QueryParam("installment") String installment, @QueryParam("status") String status);


    // Simular antecipação (POST /v3/anticipations/simulate)
    @POST
    @Path("/v3/anticipations/simulate")
    Uni<JsonNode> simularAntecipacao(JsonNode body);


    // Atualizar status da antecipação automática (PUT /v3/anticipations/configurations)
    @PUT
    @Path("/v3/anticipations/configurations")
    Uni<JsonNode> atualizarStatusDaAntecipacaoAutomatica(JsonNode body);


    // Recuperar status da antecipação automática (GET /v3/anticipations/configurations)
    @GET
    @Path("/v3/anticipations/configurations")
    Uni<JsonNode> recuperarStatusDaAntecipacaoAutomatica();


    // Recuperar limites de antecipações (GET /v3/anticipations/limits)
    @GET
    @Path("/v3/anticipations/limits")
    Uni<JsonNode> recuperarLimitesDeAntecipacoes();


    // Cancelar antecipação (POST /v3/anticipations/:id/cancel)
    @POST
    @Path("/v3/anticipations/{id}/cancel")
    Uni<JsonNode> cancelarAntecipacao(@PathParam("id") String id, JsonNode body);

}
