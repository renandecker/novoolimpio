package br.com.sol7.olimpio.asaas.clientes;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Clientes". So repassa para a API do Asaas (via
 * ClientesAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClientesController {

    @Inject
    @RestClient
    ClientesAsaasClient client;


    @POST
    @Path("/v3/customers")
    public Uni<JsonNode> criarNovoCliente(JsonNode body) {
        return client.criarNovoCliente(body);
    }

    @GET
    @Path("/v3/customers")
    public Uni<JsonNode> listarClientes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("name") String name, @QueryParam("email") String email, @QueryParam("cpfCnpj") String cpfCnpj, @QueryParam("groupName") String groupName, @QueryParam("externalReference") String externalReference) {
        return client.listarClientes(offset, limit, name, email, cpfCnpj, groupName, externalReference);
    }

    @GET
    @Path("/v3/customers/{id}")
    public Uni<JsonNode> recuperarUmUnicoCliente(@PathParam("id") String id) {
        return client.recuperarUmUnicoCliente(id);
    }

    @PUT
    @Path("/v3/customers/{id}")
    public Uni<JsonNode> atualizarClienteExistente(@PathParam("id") String id, JsonNode body) {
        return client.atualizarClienteExistente(id, body);
    }

    @DELETE
    @Path("/v3/customers/{id}")
    public Uni<JsonNode> removerCliente(@PathParam("id") String id) {
        return client.removerCliente(id);
    }

    @POST
    @Path("/v3/customers/{id}/restore")
    public Uni<JsonNode> restaurarClienteRemovido(@PathParam("id") String id, JsonNode body) {
        return client.restaurarClienteRemovido(id, body);
    }

    @GET
    @Path("/v3/customers/{id}/notifications")
    public Uni<JsonNode> recuperarNotificacoesDeUmCliente(@PathParam("id") String id) {
        return client.recuperarNotificacoesDeUmCliente(id);
    }
}
