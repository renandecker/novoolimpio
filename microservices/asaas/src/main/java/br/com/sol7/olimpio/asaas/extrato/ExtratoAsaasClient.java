package br.com.sol7.olimpio.asaas.extrato;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Extrato" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ExtratoAsaasClient {


    // Recuperar extrato (GET /v3/financialTransactions)
    @GET
    @Path("/v3/financialTransactions")
    Uni<JsonNode> recuperarExtrato(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("startDate") String startDate, @QueryParam("finishDate") String finishDate, @QueryParam("order") String order);

}
