package br.com.sol7.olimpio.asaas.clientes;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Clientes" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ClientesAsaasClient {


    // Criar novo cliente (POST /v3/customers)
    @POST
    @Path("/v3/customers")
    Uni<JsonNode> criarNovoCliente(JsonNode body);


    // Listar clientes (GET /v3/customers)
    @GET
    @Path("/v3/customers")
    Uni<JsonNode> listarClientes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("name") String name, @QueryParam("email") String email, @QueryParam("cpfCnpj") String cpfCnpj, @QueryParam("groupName") String groupName, @QueryParam("externalReference") String externalReference);


    // Recuperar um único cliente (GET /v3/customers/:id)
    @GET
    @Path("/v3/customers/{id}")
    Uni<JsonNode> recuperarUmUnicoCliente(@PathParam("id") String id);


    // Atualizar cliente existente (PUT /v3/customers/:id)
    @PUT
    @Path("/v3/customers/{id}")
    Uni<JsonNode> atualizarClienteExistente(@PathParam("id") String id, JsonNode body);


    // Remover cliente (DELETE /v3/customers/:id)
    @DELETE
    @Path("/v3/customers/{id}")
    Uni<JsonNode> removerCliente(@PathParam("id") String id);


    // Restaurar cliente removido (POST /v3/customers/:id/restore)
    @POST
    @Path("/v3/customers/{id}/restore")
    Uni<JsonNode> restaurarClienteRemovido(@PathParam("id") String id, JsonNode body);


    // Recuperar notificações de um cliente (GET /v3/customers/:id/notifications)
    @GET
    @Path("/v3/customers/{id}/notifications")
    Uni<JsonNode> recuperarNotificacoesDeUmCliente(@PathParam("id") String id);

}
