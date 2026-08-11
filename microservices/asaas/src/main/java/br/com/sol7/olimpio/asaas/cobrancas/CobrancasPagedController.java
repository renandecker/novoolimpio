package br.com.sol7.olimpio.asaas.cobrancas;

import br.com.sol7.olimpio.asaas.AsaasProxySupport;
import br.com.sol7.olimpio.shared.PagedResponse;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.Map;

/**
 * Adapter no formato PagedResponse das telas React para as cobranças do Asaas.
 * Reaproveita o Clientes... nao - o CobrancasAsaasClient e chama listarCobrancas
 * com offset/limit calculados a partir de page/size do app.
 */
@Path("/api/asaas/cobrancas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CobrancasPagedController {

    @Inject
    @RestClient
    CobrancasAsaasClient client;

    @Inject
    AsaasProxySupport support;

    @GET
    @Path("/paged")
    public Uni<PagedResponse<Map<String, Object>>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        int p = page == null ? 0 : Math.max(0, page);
        int s = size == null ? 10 : size;
        int offset = p * s;
        return client.listarCobrancas(null, String.valueOf(offset), String.valueOf(s), null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null)
                .map(response -> support.toPaged(response, p, s));
    }

    @GET
    @Path("/{id}")
    public Uni<JsonNode> find(@PathParam("id") String id) {
        return client.recuperarUmaUnicaCobranca(id);
    }

    @POST
    public Uni<JsonNode> create(JsonNode body) {
        return client.criarNovaCobranca(support.cleanBody(body));
    }

    @PUT
    @Path("/{id}")
    public Uni<JsonNode> update(@PathParam("id") String id, JsonNode body) {
        return client.atualizarCobrancaExistente(id, support.cleanBody(body));
    }

    @DELETE
    @Path("/{id}")
    public Uni<JsonNode> delete(@PathParam("id") String id) {
        return client.excluirCobranca(id);
    }
}
