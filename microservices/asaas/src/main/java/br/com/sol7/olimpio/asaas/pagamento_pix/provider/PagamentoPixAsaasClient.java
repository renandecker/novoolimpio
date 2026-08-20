package br.com.sol7.olimpio.asaas.pagamento_pix.provider;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Cliente REST reativo para os endpoints Asaas usados pela geracao/consulta de cobrancas PIX
 * (AsaasPixProviderClient). Fluxo movido do fiserv para o asaas-service. Corpo/consulta
 * trafegam como JSON generico (JsonNode) e o header de autenticacao (access_token) e injetado via
 *
 * @ClientHeaderParam (ver AsaasAuth).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface PagamentoPixAsaasClient {

    /**
     * GET /v3/customers?cpfCnpj=... - busca cliente existente pelo CPF/CNPJ (para vincular a cobranca).
     */
    @GET
    @Path("/v3/customers")
    Uni<JsonNode> listarClientes(@QueryParam("cpfCnpj") String cpfCnpj);

    /**
     * POST /v3/customers - cria cliente no Asaas quando ainda nao existe.
     */
    @POST
    @Path("/v3/customers")
    Uni<JsonNode> criarCliente(JsonNode body);

    /**
     * POST /v3/payments - cria uma cobranca (billingType = PIX).
     */
    @POST
    @Path("/v3/payments")
    Uni<JsonNode> criarCobrancaPix(JsonNode body);

    /**
     * GET /v3/payments/{id} - recupera a cobranca (status, paidValue, pixTransaction.endToEndId).
     */
    @GET
    @Path("/v3/payments/{id}")
    Uni<JsonNode> recuperarCobranca(@PathParam("id") String id);

    /**
     * GET /v3/payments/{id}/pixQrCode - payload (EMV) do QR Code PIX.
     */
    @GET
    @Path("/v3/payments/{id}/pixQrCode")
    Uni<JsonNode> obterQrCodePix(@PathParam("id") String id);
}
