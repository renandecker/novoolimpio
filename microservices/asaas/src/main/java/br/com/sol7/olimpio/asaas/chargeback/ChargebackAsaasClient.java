package br.com.sol7.olimpio.asaas.chargeback;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Chargeback" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ChargebackAsaasClient {


    // Criar disputa de chargeback (POST /v3/chargebacks/:id/dispute)
    @POST
    @Path("/v3/chargebacks/{id}/dispute")
    Uni<JsonNode> criarDisputaDeChargeback(@PathParam("id") String id);


    // Listar chargebacks (GET /v3/chargebacks/)
    @GET
    @Path("/v3/chargebacks/")
    Uni<JsonNode> listarChargebacks(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("creditCardBrand") String creditCardBrand, @QueryParam("originDisputeDate[le]") String originDisputeDate_le_, @QueryParam("originDisputeDate[ge]") String originDisputeDate_ge_, @QueryParam("originTransactionDate[le]") String originTransactionDate_le_, @QueryParam("originTransactionDate[ge]") String originTransactionDate_ge_, @QueryParam("status") String status);


    // Recuperar um único chargeback (GET /v3/payments/:id/chargeback)
    @GET
    @Path("/v3/payments/{id}/chargeback")
    Uni<JsonNode> recuperarUmUnicoChargeback(@PathParam("id") String id);

}
