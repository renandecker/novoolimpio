package br.com.sol7.olimpio.asaas.recargas_de_celular;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Recargas de celular". So repassa para a API do Asaas (via
 * RecargasDeCelularAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RecargasDeCelularController {

    @Inject
    @RestClient
    RecargasDeCelularAsaasClient client;


    @POST
    @Path("/v3/mobilePhoneRecharges")
    public Uni<JsonNode> solicitarRecarga(JsonNode body) {
        return client.solicitarRecarga(body);
    }

    @GET
    @Path("/v3/mobilePhoneRecharges")
    public Uni<JsonNode> listarRecargasDeCelular(@QueryParam("offset") String offset, @QueryParam("limit") String limit) {
        return client.listarRecargasDeCelular(offset, limit);
    }

    @GET
    @Path("/v3/mobilePhoneRecharges/{id}")
    public Uni<JsonNode> recuperarUmaUnicaRecargaDeCelular(@PathParam("id") String id) {
        return client.recuperarUmaUnicaRecargaDeCelular(id);
    }

    @POST
    @Path("/v3/mobilePhoneRecharges/{id}/cancel")
    public Uni<JsonNode> cancelarUmaRecargaDeCelular(@PathParam("id") String id, JsonNode body) {
        return client.cancelarUmaRecargaDeCelular(id, body);
    }

    @GET
    @Path("/v3/mobilePhoneRecharges/{phoneNumber}/provider")
    public Uni<JsonNode> buscarQualProvedorONumeroPertenceEOsValoresDisponiveisParaRecarga(@PathParam("phoneNumber") String phoneNumber) {
        return client.buscarQualProvedorONumeroPertenceEOsValoresDisponiveisParaRecarga(phoneNumber);
    }
}
