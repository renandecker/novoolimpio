package br.com.sol7.olimpio.asaas.informacoes_fiscais;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Informações fiscais". So repassa para a API do Asaas (via
 * InformacoesFiscaisAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InformacoesFiscaisController {

    @Inject
    @RestClient
    InformacoesFiscaisAsaasClient client;


    @GET
    @Path("/v3/fiscalInfo/municipalOptions")
    public Uni<JsonNode> listarConfiguracoesMunicipais() {
        return client.listarConfiguracoesMunicipais();
    }

    @POST
    @Path("/v3/fiscalInfo/")
    public Uni<JsonNode> criarEAtualizarInformacoesFiscais() {
        return client.criarEAtualizarInformacoesFiscais();
    }

    @GET
    @Path("/v3/fiscalInfo/")
    public Uni<JsonNode> recuperarInformacoesFiscais() {
        return client.recuperarInformacoesFiscais();
    }

    @GET
    @Path("/v3/fiscalInfo/services")
    public Uni<JsonNode> listarServicosMunicipais(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("description") String description) {
        return client.listarServicosMunicipais(offset, limit, description);
    }

    @POST
    @Path("/v3/fiscalInfo/nationalPortal")
    public Uni<JsonNode> configurarPortalEmissorDeNotasFiscais(JsonNode body) {
        return client.configurarPortalEmissorDeNotasFiscais(body);
    }
}
