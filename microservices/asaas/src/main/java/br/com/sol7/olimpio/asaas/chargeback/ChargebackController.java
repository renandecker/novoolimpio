package br.com.sol7.olimpio.asaas.chargeback;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Chargeback". So repassa para a API do Asaas (via
 * ChargebackAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChargebackController {

    @Inject
    @RestClient
    ChargebackAsaasClient client;


    @POST
    @Path("/v3/chargebacks/{id}/dispute")
    public Uni<JsonNode> criarDisputaDeChargeback(@PathParam("id") String id) {
        return client.criarDisputaDeChargeback(id);
    }

    @GET
    @Path("/v3/chargebacks/")
    public Uni<JsonNode> listarChargebacks(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("creditCardBrand") String creditCardBrand, @QueryParam("originDisputeDate[le]") String originDisputeDate_le_, @QueryParam("originDisputeDate[ge]") String originDisputeDate_ge_, @QueryParam("originTransactionDate[le]") String originTransactionDate_le_, @QueryParam("originTransactionDate[ge]") String originTransactionDate_ge_, @QueryParam("status") String status) {
        return client.listarChargebacks(offset, limit, creditCardBrand, originDisputeDate_le_, originDisputeDate_ge_, originTransactionDate_le_, originTransactionDate_ge_, status);
    }

    @GET
    @Path("/v3/payments/{id}/chargeback")
    public Uni<JsonNode> recuperarUmUnicoChargeback(@PathParam("id") String id) {
        return client.recuperarUmUnicoChargeback(id);
    }
}
