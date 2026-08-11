package br.com.sol7.olimpio.asaas.informacoes_fiscais;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Informações fiscais" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface InformacoesFiscaisAsaasClient {


    // Listar configurações municipais (GET /v3/fiscalInfo/municipalOptions)
    @GET
    @Path("/v3/fiscalInfo/municipalOptions")
    Uni<JsonNode> listarConfiguracoesMunicipais();


    // Criar e atualizar informações fiscais (POST /v3/fiscalInfo/)
    @POST
    @Path("/v3/fiscalInfo/")
    Uni<JsonNode> criarEAtualizarInformacoesFiscais();


    // Recuperar informações fiscais (GET /v3/fiscalInfo/)
    @GET
    @Path("/v3/fiscalInfo/")
    Uni<JsonNode> recuperarInformacoesFiscais();


    // Listar serviços municipais (GET /v3/fiscalInfo/services)
    @GET
    @Path("/v3/fiscalInfo/services")
    Uni<JsonNode> listarServicosMunicipais(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("description") String description);


    // Configurar portal emissor de notas fiscais (POST /v3/fiscalInfo/nationalPortal)
    @POST
    @Path("/v3/fiscalInfo/nationalPortal")
    Uni<JsonNode> configurarPortalEmissorDeNotasFiscais(JsonNode body);

}
