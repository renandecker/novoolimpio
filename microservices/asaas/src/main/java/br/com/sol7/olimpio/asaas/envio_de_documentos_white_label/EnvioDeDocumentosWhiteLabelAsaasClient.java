package br.com.sol7.olimpio.asaas.envio_de_documentos_white_label;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Envio de documentos White Label" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface EnvioDeDocumentosWhiteLabelAsaasClient {


    // Verificar documentos pendentes (GET /v3/myAccount/documents)
    @GET
    @Path("/v3/myAccount/documents")
    Uni<JsonNode> verificarDocumentosPendentes();


    // Enviar documentos via API (POST /v3/myAccount/documents/:id)
    @POST
    @Path("/v3/myAccount/documents/{id}")
    Uni<JsonNode> enviarDocumentosViaApi(@PathParam("id") String id);


    // Visualizar documento enviado (GET /v3/myAccount/documents/files/:id)
    @GET
    @Path("/v3/myAccount/documents/files/{id}")
    Uni<JsonNode> visualizarDocumentoEnviado(@PathParam("id") String id);


    // Atualizar documento enviado (POST /v3/myAccount/documents/files/:id)
    @POST
    @Path("/v3/myAccount/documents/files/{id}")
    Uni<JsonNode> atualizarDocumentoEnviado(@PathParam("id") String id);


    // Remover documento enviado (DELETE /v3/myAccount/documents/files/:id)
    @DELETE
    @Path("/v3/myAccount/documents/files/{id}")
    Uni<JsonNode> removerDocumentoEnviado(@PathParam("id") String id);

}
