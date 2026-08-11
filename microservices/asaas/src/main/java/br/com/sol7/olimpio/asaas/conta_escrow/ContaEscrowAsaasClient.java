package br.com.sol7.olimpio.asaas.conta_escrow;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Conta Escrow" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ContaEscrowAsaasClient {


    // Encerrar garantia da cobrança na Conta Escrow (POST /v3/escrow/:id/finish)
    @POST
    @Path("/v3/escrow/{id}/finish")
    Uni<JsonNode> encerrarGarantiaDaCobrancaNaContaEscrow(@PathParam("id") String id, JsonNode body);

}
