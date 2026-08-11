package br.com.sol7.olimpio.asaas.informacoes_e_personalizacao_da_conta;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Informações e personalização da conta" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface InformacoesEPersonalizacaoDaContaAsaasClient {


    // Recuperar dados comerciais (GET /v3/myAccount/commercialInfo/)
    @GET
    @Path("/v3/myAccount/commercialInfo/")
    Uni<JsonNode> recuperarDadosComerciais();


    // Atualizar dados comerciais (POST /v3/myAccount/commercialInfo/)
    @POST
    @Path("/v3/myAccount/commercialInfo/")
    Uni<JsonNode> atualizarDadosComerciais(JsonNode body);


    // Salvar personalização da fatura (POST /v3/myAccount/paymentCheckoutConfig/)
    @POST
    @Path("/v3/myAccount/paymentCheckoutConfig/")
    Uni<JsonNode> salvarPersonalizacaoDaFatura();


    // Recuperar configurações de personalização (GET /v3/myAccount/paymentCheckoutConfig/)
    @GET
    @Path("/v3/myAccount/paymentCheckoutConfig/")
    Uni<JsonNode> recuperarConfiguracoesDePersonalizacao();


    // Recuperar número de conta no Asaas (GET /v3/myAccount/accountNumber)
    @GET
    @Path("/v3/myAccount/accountNumber")
    Uni<JsonNode> recuperarNumeroDeContaNoAsaas();


    // Recuperar taxas da conta (GET /v3/myAccount/fees/)
    @GET
    @Path("/v3/myAccount/fees/")
    Uni<JsonNode> recuperarTaxasDaConta();


    // Consultar situação cadastral da conta (GET /v3/myAccount/status/)
    @GET
    @Path("/v3/myAccount/status/")
    Uni<JsonNode> consultarSituacaoCadastralDaConta();


    // Recuperar WalletId (GET /v3/wallets/)
    @GET
    @Path("/v3/wallets/")
    Uni<JsonNode> recuperarWalletid();


    // Excluir subconta White Label (DELETE /v3/myAccount/)
    @DELETE
    @Path("/v3/myAccount/")
    Uni<JsonNode> excluirSubcontaWhiteLabel(@QueryParam("removeReason") String removeReason);

}
