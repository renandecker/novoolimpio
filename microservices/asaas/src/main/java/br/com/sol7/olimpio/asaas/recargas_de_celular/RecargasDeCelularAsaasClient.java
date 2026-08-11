package br.com.sol7.olimpio.asaas.recargas_de_celular;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Recargas de celular" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface RecargasDeCelularAsaasClient {


    // Solicitar recarga (POST /v3/mobilePhoneRecharges)
    @POST
    @Path("/v3/mobilePhoneRecharges")
    Uni<JsonNode> solicitarRecarga(JsonNode body);


    // Listar recargas de celular (GET /v3/mobilePhoneRecharges)
    @GET
    @Path("/v3/mobilePhoneRecharges")
    Uni<JsonNode> listarRecargasDeCelular(@QueryParam("offset") String offset, @QueryParam("limit") String limit);


    // Recuperar uma única recarga de celular (GET /v3/mobilePhoneRecharges/:id)
    @GET
    @Path("/v3/mobilePhoneRecharges/{id}")
    Uni<JsonNode> recuperarUmaUnicaRecargaDeCelular(@PathParam("id") String id);


    // Cancelar uma recarga de celular (POST /v3/mobilePhoneRecharges/:id/cancel)
    @POST
    @Path("/v3/mobilePhoneRecharges/{id}/cancel")
    Uni<JsonNode> cancelarUmaRecargaDeCelular(@PathParam("id") String id, JsonNode body);


    // Buscar qual provedor o número pertence e os valores disponíveis para recarga (GET /v3/mobilePhoneRecharges/:phoneNumber/provider)
    @GET
    @Path("/v3/mobilePhoneRecharges/{phoneNumber}/provider")
    Uni<JsonNode> buscarQualProvedorONumeroPertenceEOsValoresDisponiveisParaRecarga(@PathParam("phoneNumber") String phoneNumber);

}
