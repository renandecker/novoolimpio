package br.com.sol7.olimpio.asaas.transacoes_pix;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Transações Pix". So repassa para a API do Asaas (via
 * TransacoesPixAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TransacoesPixController {

    @Inject
    @RestClient
    TransacoesPixAsaasClient client;


    @POST
    @Path("/v3/pix/qrCodes/pay")
    public Uni<JsonNode> pagarUmQrcode(JsonNode body) {
        return client.pagarUmQrcode(body);
    }

    @POST
    @Path("/v3/pix/qrCodes/decode")
    public Uni<JsonNode> decodificarUmQrcodeParaPagamento(JsonNode body) {
        return client.decodificarUmQrcodeParaPagamento(body);
    }

    @GET
    @Path("/v3/pix/transactions/{id}")
    public Uni<JsonNode> recuperarUmaUnicaTransacao(@PathParam("id") String id) {
        return client.recuperarUmaUnicaTransacao(id);
    }

    @GET
    @Path("/v3/pix/transactions")
    public Uni<JsonNode> listarTransacoes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("type") String type, @QueryParam("endToEndIdentifier") String endToEndIdentifier) {
        return client.listarTransacoes(offset, limit, status, type, endToEndIdentifier);
    }

    @POST
    @Path("/v3/pix/transactions/{id}/cancel")
    public Uni<JsonNode> cancelarUmaTransacaoAgendada(@PathParam("id") String id, JsonNode body) {
        return client.cancelarUmaTransacaoAgendada(id, body);
    }
}
