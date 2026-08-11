package br.com.sol7.olimpio.asaas.splits;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Splits" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface SplitsAsaasClient {


    // Recuperar um único split pago (GET /v3/payments/splits/paid/:id)
    @GET
    @Path("/v3/payments/splits/paid/{id}")
    Uni<JsonNode> recuperarUmUnicoSplitPago(@PathParam("id") String id);


    // Listar splits pagos (GET /v3/payments/splits/paid)
    @GET
    @Path("/v3/payments/splits/paid")
    Uni<JsonNode> listarSplitsPagos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("paymentId") String paymentId, @QueryParam("status") String status, @QueryParam("paymentConfirmedDate[ge]") String paymentConfirmedDate_ge_, @QueryParam("paymentConfirmedDate[le]") String paymentConfirmedDate_le_, @QueryParam("creditDate[ge]") String creditDate_ge_, @QueryParam("creditDate[le]") String creditDate_le_);


    // Recuperar um único split recebido (GET /v3/payments/splits/received/:id)
    @GET
    @Path("/v3/payments/splits/received/{id}")
    Uni<JsonNode> recuperarUmUnicoSplitRecebido(@PathParam("id") String id);


    // Listar splits recebidos (GET /v3/payments/splits/received)
    @GET
    @Path("/v3/payments/splits/received")
    Uni<JsonNode> listarSplitsRecebidos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("paymentId") String paymentId, @QueryParam("status") String status, @QueryParam("paymentConfirmedDate[ge]") String paymentConfirmedDate_ge_, @QueryParam("paymentConfirmedDate[le]") String paymentConfirmedDate_le_, @QueryParam("creditDate[ge]") String creditDate_ge_, @QueryParam("creditDate[le]") String creditDate_le_);

}
