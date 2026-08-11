package br.com.sol7.olimpio.asaas.extrato;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Extrato". So repassa para a API do Asaas (via
 * ExtratoAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExtratoController {

    @Inject
    @RestClient
    ExtratoAsaasClient client;


    @GET
    @Path("/v3/financialTransactions")
    public Uni<JsonNode> recuperarExtrato(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("startDate") String startDate, @QueryParam("finishDate") String finishDate, @QueryParam("order") String order) {
        return client.recuperarExtrato(offset, limit, startDate, finishDate, order);
    }
}
