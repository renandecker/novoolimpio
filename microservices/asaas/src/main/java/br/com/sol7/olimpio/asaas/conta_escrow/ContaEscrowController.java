package br.com.sol7.olimpio.asaas.conta_escrow;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Conta Escrow". So repassa para a API do Asaas (via
 * ContaEscrowAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContaEscrowController {

    @Inject
    @RestClient
    ContaEscrowAsaasClient client;


    @POST
    @Path("/v3/escrow/{id}/finish")
    public Uni<JsonNode> encerrarGarantiaDaCobrancaNaContaEscrow(@PathParam("id") String id, JsonNode body) {
        return client.encerrarGarantiaDaCobrancaNaContaEscrow(id, body);
    }
}
