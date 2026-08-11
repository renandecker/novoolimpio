package br.com.sol7.olimpio.asaas.pix;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Pix". So repassa para a API do Asaas (via
 * PixAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PixController {

    @Inject
    @RestClient
    PixAsaasClient client;


    @POST
    @Path("/v3/pix/addressKeys")
    public Uni<JsonNode> criarUmaChave(JsonNode body) {
        return client.criarUmaChave(body);
    }

    @GET
    @Path("/v3/pix/addressKeys")
    public Uni<JsonNode> listarChaves(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("statusList") String statusList) {
        return client.listarChaves(offset, limit, status, statusList);
    }

    @GET
    @Path("/v3/pix/addressKeys/{id}")
    public Uni<JsonNode> recuperarUmaUnicaChave(@PathParam("id") String id) {
        return client.recuperarUmaUnicaChave(id);
    }

    @DELETE
    @Path("/v3/pix/addressKeys/{id}")
    public Uni<JsonNode> removerChave(@PathParam("id") String id) {
        return client.removerChave(id);
    }

    @POST
    @Path("/v3/pix/qrCodes/static")
    public Uni<JsonNode> criarQrCodeEstatico(JsonNode body) {
        return client.criarQrCodeEstatico(body);
    }

    @DELETE
    @Path("/v3/pix/qrCodes/static/{id}")
    public Uni<JsonNode> deletarQrCodeEstatico(@PathParam("id") String id) {
        return client.deletarQrCodeEstatico(id);
    }
}
