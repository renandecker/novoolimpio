package br.com.sol7.olimpio.asaas.pagamento_de_contas;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Pagamento de contas" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface PagamentoDeContasAsaasClient {


    // Criar um pagamento de conta (POST /v3/bill)
    @POST
    @Path("/v3/bill")
    Uni<JsonNode> criarUmPagamentoDeConta(JsonNode body);


    // Listar pagamento de contas (GET /v3/bill)
    @GET
    @Path("/v3/bill")
    Uni<JsonNode> listarPagamentoDeContas(@QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Simular um pagamento de conta (POST /v3/bill/simulate)
    @POST
    @Path("/v3/bill/simulate")
    Uni<JsonNode> simularUmPagamentoDeConta(JsonNode body);


    // Recuperar um único pagamento de conta (GET /v3/bill/:id)
    @GET
    @Path("/v3/bill/{id}")
    Uni<JsonNode> recuperarUmUnicoPagamentoDeConta(@PathParam("id") String id);


    // Cancelar pagamento de contas (POST /v3/bill/:id/cancel)
    @POST
    @Path("/v3/bill/{id}/cancel")
    Uni<JsonNode> cancelarPagamentoDeContas(@PathParam("id") String id, JsonNode body);

}
