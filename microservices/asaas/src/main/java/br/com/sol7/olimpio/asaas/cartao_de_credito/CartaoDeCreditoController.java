package br.com.sol7.olimpio.asaas.cartao_de_credito;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Cartão de crédito". So repassa para a API do Asaas (via
 * CartaoDeCreditoAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CartaoDeCreditoController {

    @Inject
    @RestClient
    CartaoDeCreditoAsaasClient client;


    @POST
    @Path("/v3/creditCard/tokenizeCreditCard")
    public Uni<JsonNode> tokenizacaoDeCartaoDeCredito(JsonNode body) {
        return client.tokenizacaoDeCartaoDeCredito(body);
    }
}
