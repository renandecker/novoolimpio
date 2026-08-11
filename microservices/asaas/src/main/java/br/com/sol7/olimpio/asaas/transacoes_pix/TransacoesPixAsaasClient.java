package br.com.sol7.olimpio.asaas.transacoes_pix;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Transações Pix" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface TransacoesPixAsaasClient {


    // Pagar um QRCode (POST /v3/pix/qrCodes/pay)
    @POST
    @Path("/v3/pix/qrCodes/pay")
    Uni<JsonNode> pagarUmQrcode(JsonNode body);


    // Decodificar um QRCode para pagamento (POST /v3/pix/qrCodes/decode)
    @POST
    @Path("/v3/pix/qrCodes/decode")
    Uni<JsonNode> decodificarUmQrcodeParaPagamento(JsonNode body);


    // Recuperar uma única transação (GET /v3/pix/transactions/:id)
    @GET
    @Path("/v3/pix/transactions/{id}")
    Uni<JsonNode> recuperarUmaUnicaTransacao(@PathParam("id") String id);


    // Listar transações (GET /v3/pix/transactions)
    @GET
    @Path("/v3/pix/transactions")
    Uni<JsonNode> listarTransacoes(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("status") String status, @QueryParam("type") String type, @QueryParam("endToEndIdentifier") String endToEndIdentifier);


    // Cancelar uma transação agendada (POST /v3/pix/transactions/:id/cancel)
    @POST
    @Path("/v3/pix/transactions/{id}/cancel")
    Uni<JsonNode> cancelarUmaTransacaoAgendada(@PathParam("id") String id, JsonNode body);

}
