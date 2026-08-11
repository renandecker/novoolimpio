package br.com.sol7.olimpio.asaas.estornos;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Estornos" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface EstornosAsaasClient {


    // Listar estornos de uma cobrança (GET /v3/payments/:id/refunds)
    @GET
    @Path("/v3/payments/{id}/refunds")
    Uni<JsonNode> listarEstornosDeUmaCobranca(@PathParam("id") String id);


    // Estornar boleto (POST /v3/payments/:id/bankSlip/refund)
    @POST
    @Path("/v3/payments/{id}/bankSlip/refund")
    Uni<JsonNode> estornarBoleto(@PathParam("id") String id, JsonNode body);

}
