package br.com.sol7.olimpio.asaas.consulta_serasa;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Consulta Serasa" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface ConsultaSerasaAsaasClient {


    // Realizar consulta (POST /v3/creditBureauReport)
    @POST
    @Path("/v3/creditBureauReport")
    Uni<JsonNode> realizarConsulta(JsonNode body);


    // Listar consultas (GET /v3/creditBureauReport)
    @GET
    @Path("/v3/creditBureauReport")
    Uni<JsonNode> listarConsultas(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("startDate") String startDate, @QueryParam("endDate") String endDate);


    // Recuperar uma consulta (GET /v3/creditBureauReport/:id)
    @GET
    @Path("/v3/creditBureauReport/{id}")
    Uni<JsonNode> recuperarUmaConsulta(@PathParam("id") String id);

}
