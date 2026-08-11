package br.com.sol7.olimpio.asaas.subcontas_asaas;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Subcontas Asaas". So repassa para a API do Asaas (via
 * SubcontasAsaasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SubcontasAsaasController {

    @Inject
    @RestClient
    SubcontasAsaasAsaasClient client;


    @POST
    @Path("/v3/accounts")
    public Uni<JsonNode> criarSubconta(JsonNode body) {
        return client.criarSubconta(body);
    }

    @GET
    @Path("/v3/accounts")
    public Uni<JsonNode> listarSubcontas(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("cpfCnpj") String cpfCnpj, @QueryParam("email") String email, @QueryParam("name") String name, @QueryParam("walletId") String walletId) {
        return client.listarSubcontas(offset, limit, cpfCnpj, email, name, walletId);
    }

    @GET
    @Path("/v3/accounts/{id}")
    public Uni<JsonNode> recuperarUmaUnicaSubconta(@PathParam("id") String id) {
        return client.recuperarUmaUnicaSubconta(id);
    }

    @POST
    @Path("/v3/accounts/{id}/escrow")
    public Uni<JsonNode> salvarOuAtualizarConfiguracaoDaContaEscrowParaASubconta(@PathParam("id") String id, JsonNode body) {
        return client.salvarOuAtualizarConfiguracaoDaContaEscrowParaASubconta(id, body);
    }

    @GET
    @Path("/v3/accounts/{id}/escrow")
    public Uni<JsonNode> recuperarConfiguracaoDaContaEscrowParaASubconta(@PathParam("id") String id) {
        return client.recuperarConfiguracaoDaContaEscrowParaASubconta(id);
    }
}
