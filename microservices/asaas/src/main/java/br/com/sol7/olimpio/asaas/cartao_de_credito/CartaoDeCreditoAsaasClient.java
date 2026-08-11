package br.com.sol7.olimpio.asaas.cartao_de_credito;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Cartão de crédito" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface CartaoDeCreditoAsaasClient {


    // Tokenização de cartão de crédito (POST /v3/creditCard/tokenizeCreditCard)
    @POST
    @Path("/v3/creditCard/tokenizeCreditCard")
    Uni<JsonNode> tokenizacaoDeCartaoDeCredito(JsonNode body);

}
