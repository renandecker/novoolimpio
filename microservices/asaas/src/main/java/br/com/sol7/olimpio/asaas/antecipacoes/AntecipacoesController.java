package br.com.sol7.olimpio.asaas.antecipacoes;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Antecipações". So repassa para a API do Asaas (via
 * AntecipacoesAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AntecipacoesController {

    @Inject
    @RestClient
    AntecipacoesAsaasClient client;


    @GET
    @Path("/v3/anticipations/{id}")
    public Uni<JsonNode> recuperarUmaUnicaAntecipacao(@PathParam("id") String id) {
        return client.recuperarUmaUnicaAntecipacao(id);
    }

    @POST
    @Path("/v3/anticipations")
    public Uni<JsonNode> solicitarAntecipacao() {
        return client.solicitarAntecipacao();
    }

    @GET
    @Path("/v3/anticipations")
    public Uni<JsonNode> listarAntecipacoes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("payment") String payment, @QueryParam("installment") String installment, @QueryParam("status") String status) {
        return client.listarAntecipacoes(offset, limit, payment, installment, status);
    }

    @POST
    @Path("/v3/anticipations/simulate")
    public Uni<JsonNode> simularAntecipacao(JsonNode body) {
        return client.simularAntecipacao(body);
    }

    @PUT
    @Path("/v3/anticipations/configurations")
    public Uni<JsonNode> atualizarStatusDaAntecipacaoAutomatica(JsonNode body) {
        return client.atualizarStatusDaAntecipacaoAutomatica(body);
    }

    @GET
    @Path("/v3/anticipations/configurations")
    public Uni<JsonNode> recuperarStatusDaAntecipacaoAutomatica() {
        return client.recuperarStatusDaAntecipacaoAutomatica();
    }

    @GET
    @Path("/v3/anticipations/limits")
    public Uni<JsonNode> recuperarLimitesDeAntecipacoes() {
        return client.recuperarLimitesDeAntecipacoes();
    }

    @POST
    @Path("/v3/anticipations/{id}/cancel")
    public Uni<JsonNode> cancelarAntecipacao(@PathParam("id") String id, JsonNode body) {
        return client.cancelarAntecipacao(id, body);
    }
}
