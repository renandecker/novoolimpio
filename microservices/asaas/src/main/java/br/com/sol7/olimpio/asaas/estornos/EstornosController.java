package br.com.sol7.olimpio.asaas.estornos;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Estornos". So repassa para a API do Asaas (via
 * EstornosAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstornosController {

    @Inject
    @RestClient
    EstornosAsaasClient client;


    @GET
    @Path("/v3/payments/{id}/refunds")
    public Uni<JsonNode> listarEstornosDeUmaCobranca(@PathParam("id") String id) {
        return client.listarEstornosDeUmaCobranca(id);
    }

    @POST
    @Path("/v3/payments/{id}/bankSlip/refund")
    public Uni<JsonNode> estornarBoleto(@PathParam("id") String id, JsonNode body) {
        return client.estornarBoleto(id, body);
    }
}
