package br.com.sol7.olimpio.asaas.subcontas_asaas;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Subcontas Asaas" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface SubcontasAsaasAsaasClient {


    // Criar subconta (POST /v3/accounts)
    @POST
    @Path("/v3/accounts")
    Uni<JsonNode> criarSubconta(JsonNode body);


    // Listar subcontas (GET /v3/accounts)
    @GET
    @Path("/v3/accounts")
    Uni<JsonNode> listarSubcontas(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("cpfCnpj") String cpfCnpj, @QueryParam("email") String email, @QueryParam("name") String name, @QueryParam("walletId") String walletId);


    // Recuperar uma única subconta (GET /v3/accounts/:id)
    @GET
    @Path("/v3/accounts/{id}")
    Uni<JsonNode> recuperarUmaUnicaSubconta(@PathParam("id") String id);


    // Salvar ou atualizar configuração da Conta Escrow para a subconta (POST /v3/accounts/:id/escrow)
    @POST
    @Path("/v3/accounts/{id}/escrow")
    Uni<JsonNode> salvarOuAtualizarConfiguracaoDaContaEscrowParaASubconta(@PathParam("id") String id, JsonNode body);


    // Recuperar configuração da Conta Escrow para a subconta (GET /v3/accounts/:id/escrow)
    @GET
    @Path("/v3/accounts/{id}/escrow")
    Uni<JsonNode> recuperarConfiguracaoDaContaEscrowParaASubconta(@PathParam("id") String id);

}
