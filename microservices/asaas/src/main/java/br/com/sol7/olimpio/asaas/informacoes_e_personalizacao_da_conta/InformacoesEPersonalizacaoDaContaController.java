package br.com.sol7.olimpio.asaas.informacoes_e_personalizacao_da_conta;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Informações e personalização da conta". So repassa para a API do Asaas (via
 * InformacoesEPersonalizacaoDaContaAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InformacoesEPersonalizacaoDaContaController {

    @Inject
    @RestClient
    InformacoesEPersonalizacaoDaContaAsaasClient client;


    @GET
    @Path("/v3/myAccount/commercialInfo/")
    public Uni<JsonNode> recuperarDadosComerciais() {
        return client.recuperarDadosComerciais();
    }

    @POST
    @Path("/v3/myAccount/commercialInfo/")
    public Uni<JsonNode> atualizarDadosComerciais(JsonNode body) {
        return client.atualizarDadosComerciais(body);
    }

    @POST
    @Path("/v3/myAccount/paymentCheckoutConfig/")
    public Uni<JsonNode> salvarPersonalizacaoDaFatura() {
        return client.salvarPersonalizacaoDaFatura();
    }

    @GET
    @Path("/v3/myAccount/paymentCheckoutConfig/")
    public Uni<JsonNode> recuperarConfiguracoesDePersonalizacao() {
        return client.recuperarConfiguracoesDePersonalizacao();
    }

    @GET
    @Path("/v3/myAccount/accountNumber")
    public Uni<JsonNode> recuperarNumeroDeContaNoAsaas() {
        return client.recuperarNumeroDeContaNoAsaas();
    }

    @GET
    @Path("/v3/myAccount/fees/")
    public Uni<JsonNode> recuperarTaxasDaConta() {
        return client.recuperarTaxasDaConta();
    }

    @GET
    @Path("/v3/myAccount/status/")
    public Uni<JsonNode> consultarSituacaoCadastralDaConta() {
        return client.consultarSituacaoCadastralDaConta();
    }

    @GET
    @Path("/v3/wallets/")
    public Uni<JsonNode> recuperarWalletid() {
        return client.recuperarWalletid();
    }

    @DELETE
    @Path("/v3/myAccount/")
    public Uni<JsonNode> excluirSubcontaWhiteLabel(@QueryParam("removeReason") String removeReason) {
        return client.excluirSubcontaWhiteLabel(removeReason);
    }
}
