package br.com.sol7.olimpio.asaas.pix;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Pix" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface PixAsaasClient {


    // Criar uma chave (POST /v3/pix/addressKeys)
    @POST
    @Path("/v3/pix/addressKeys")
    Uni<JsonNode> criarUmaChave(JsonNode body);


    // Listar chaves (GET /v3/pix/addressKeys)
    @GET
    @Path("/v3/pix/addressKeys")
    Uni<JsonNode> listarChaves(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("statusList") String statusList);


    // Recuperar uma única chave (GET /v3/pix/addressKeys/:id)
    @GET
    @Path("/v3/pix/addressKeys/{id}")
    Uni<JsonNode> recuperarUmaUnicaChave(@PathParam("id") String id);


    // Remover chave (DELETE /v3/pix/addressKeys/:id)
    @DELETE
    @Path("/v3/pix/addressKeys/{id}")
    Uni<JsonNode> removerChave(@PathParam("id") String id);


    // Criar QR Code estático (POST /v3/pix/qrCodes/static)
    @POST
    @Path("/v3/pix/qrCodes/static")
    Uni<JsonNode> criarQrCodeEstatico(JsonNode body);


    // Deletar QR Code estático (DELETE /v3/pix/qrCodes/static/:id)
    @DELETE
    @Path("/v3/pix/qrCodes/static/{id}")
    Uni<JsonNode> deletarQrCodeEstatico(@PathParam("id") String id);

}
