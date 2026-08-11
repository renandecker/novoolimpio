package br.com.sol7.olimpio.asaas.transferencias;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Transferências". So repassa para a API do Asaas (via
 * TransferenciasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TransferenciasController {

    @Inject
    @RestClient
    TransferenciasAsaasClient client;


    @POST
    @Path("/v3/transfers")
    public Uni<JsonNode> transferirParaContaDeOutraInstituicaoOuChavePix(JsonNode body) {
        return client.transferirParaContaDeOutraInstituicaoOuChavePix(body);
    }

    @GET
    @Path("/v3/transfers")
    public Uni<JsonNode> listarTransferencias(@QueryParam("dateCreatedLe[ge]") String dateCreatedLe_ge_, @QueryParam("dateCreatedLe[le]") String dateCreatedLe_le_, @QueryParam("transferDate[ge]") String transferDate_ge_, @QueryParam("transferDate[le]") String transferDate_le_, @QueryParam("type") String type) {
        return client.listarTransferencias(dateCreatedLe_ge_, dateCreatedLe_le_, transferDate_ge_, transferDate_le_, type);
    }

    @POST
    @Path("/v3/transfers/")
    public Uni<JsonNode> transferirParaContaAsaas(JsonNode body) {
        return client.transferirParaContaAsaas(body);
    }

    @GET
    @Path("/v3/transfers/{id}")
    public Uni<JsonNode> recuperarUmaUnicaTransferencia(@PathParam("id") String id) {
        return client.recuperarUmaUnicaTransferencia(id);
    }

    @DELETE
    @Path("/v3/transfers/{id}/cancel")
    public Uni<JsonNode> cancelarUmaTransferencia(@PathParam("id") String id) {
        return client.cancelarUmaTransferencia(id);
    }
}
