package br.com.sol7.olimpio.asaas.consulta_serasa;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Consulta Serasa". So repassa para a API do Asaas (via
 * ConsultaSerasaAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ConsultaSerasaController {

    @Inject
    @RestClient
    ConsultaSerasaAsaasClient client;


    @POST
    @Path("/v3/creditBureauReport")
    public Uni<JsonNode> realizarConsulta(JsonNode body) {
        return client.realizarConsulta(body);
    }

    @GET
    @Path("/v3/creditBureauReport")
    public Uni<JsonNode> listarConsultas(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("startDate") String startDate, @QueryParam("endDate") String endDate) {
        return client.listarConsultas(offset, limit, startDate, endDate);
    }

    @GET
    @Path("/v3/creditBureauReport/{id}")
    public Uni<JsonNode> recuperarUmaConsulta(@PathParam("id") String id) {
        return client.recuperarUmaConsulta(id);
    }
}
