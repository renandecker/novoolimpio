package br.com.sol7.olimpio.asaas.transferencias;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Transferências" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface TransferenciasAsaasClient {


    // Transferir para conta de outra Instituição ou chave Pix (POST /v3/transfers)
    @POST
    @Path("/v3/transfers")
    Uni<JsonNode> transferirParaContaDeOutraInstituicaoOuChavePix(JsonNode body);


    // Listar transferências (GET /v3/transfers)
    @GET
    @Path("/v3/transfers")
    Uni<JsonNode> listarTransferencias(@QueryParam("dateCreatedLe[ge]") String dateCreatedLe_ge_, @QueryParam("dateCreatedLe[le]") String dateCreatedLe_le_, @QueryParam("transferDate[ge]") String transferDate_ge_, @QueryParam("transferDate[le]") String transferDate_le_, @QueryParam("type") String type);


    // Transferir para conta Asaas (POST /v3/transfers/)
    @POST
    @Path("/v3/transfers/")
    Uni<JsonNode> transferirParaContaAsaas(JsonNode body);


    // Recuperar uma única transferência (GET /v3/transfers/:id)
    @GET
    @Path("/v3/transfers/{id}")
    Uni<JsonNode> recuperarUmaUnicaTransferencia(@PathParam("id") String id);


    // Cancelar uma transferência (DELETE /v3/transfers/:id/cancel)
    @DELETE
    @Path("/v3/transfers/{id}/cancel")
    Uni<JsonNode> cancelarUmaTransferencia(@PathParam("id") String id);

}
