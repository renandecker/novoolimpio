package br.com.sol7.olimpio.asaas.splits;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Splits". So repassa para a API do Asaas (via
 * SplitsAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SplitsController {

    @Inject
    @RestClient
    SplitsAsaasClient client;


    @GET
    @Path("/v3/payments/splits/paid/{id}")
    public Uni<JsonNode> recuperarUmUnicoSplitPago(@PathParam("id") String id) {
        return client.recuperarUmUnicoSplitPago(id);
    }

    @GET
    @Path("/v3/payments/splits/paid")
    public Uni<JsonNode> listarSplitsPagos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("paymentId") String paymentId, @QueryParam("status") String status, @QueryParam("paymentConfirmedDate[ge]") String paymentConfirmedDate_ge_, @QueryParam("paymentConfirmedDate[le]") String paymentConfirmedDate_le_, @QueryParam("creditDate[ge]") String creditDate_ge_, @QueryParam("creditDate[le]") String creditDate_le_) {
        return client.listarSplitsPagos(offset, limit, paymentId, status, paymentConfirmedDate_ge_, paymentConfirmedDate_le_, creditDate_ge_, creditDate_le_);
    }

    @GET
    @Path("/v3/payments/splits/received/{id}")
    public Uni<JsonNode> recuperarUmUnicoSplitRecebido(@PathParam("id") String id) {
        return client.recuperarUmUnicoSplitRecebido(id);
    }

    @GET
    @Path("/v3/payments/splits/received")
    public Uni<JsonNode> listarSplitsRecebidos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("paymentId") String paymentId, @QueryParam("status") String status, @QueryParam("paymentConfirmedDate[ge]") String paymentConfirmedDate_ge_, @QueryParam("paymentConfirmedDate[le]") String paymentConfirmedDate_le_, @QueryParam("creditDate[ge]") String creditDate_ge_, @QueryParam("creditDate[le]") String creditDate_le_) {
        return client.listarSplitsRecebidos(offset, limit, paymentId, status, paymentConfirmedDate_ge_, paymentConfirmedDate_le_, creditDate_ge_, creditDate_le_);
    }
}
