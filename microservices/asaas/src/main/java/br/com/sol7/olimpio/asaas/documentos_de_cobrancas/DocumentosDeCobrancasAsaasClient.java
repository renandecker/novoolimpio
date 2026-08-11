package br.com.sol7.olimpio.asaas.documentos_de_cobrancas;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Documentos de cobranças" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface DocumentosDeCobrancasAsaasClient {


    // Fazer upload de documentos da cobrança (POST /v3/payments/:id/documents)
    @POST
    @Path("/v3/payments/{id}/documents")
    Uni<JsonNode> fazerUploadDeDocumentosDaCobranca(@PathParam("id") String id);


    // Listar documentos de uma cobrança (GET /v3/payments/:id/documents)
    @GET
    @Path("/v3/payments/{id}/documents")
    Uni<JsonNode> listarDocumentosDeUmaCobranca(@PathParam("id") String id);


    // Atualizar definições de um documento da cobrança (PUT /v3/payments/:id/documents/:documentId)
    @PUT
    @Path("/v3/payments/{id}/documents/{documentId}")
    Uni<JsonNode> atualizarDefinicoesDeUmDocumentoDaCobranca(@PathParam("id") String id, @PathParam("documentId") String documentId, JsonNode body);


    // Recuperar um único documento da cobrança (GET /v3/payments/:id/documents/:documentId)
    @GET
    @Path("/v3/payments/{id}/documents/{documentId}")
    Uni<JsonNode> recuperarUmUnicoDocumentoDaCobranca(@PathParam("id") String id, @PathParam("documentId") String documentId);


    // Excluir documento de uma cobrança (DELETE /v3/payments/:id/documents/:documentId)
    @DELETE
    @Path("/v3/payments/{id}/documents/{documentId}")
    Uni<JsonNode> excluirDocumentoDeUmaCobranca(@PathParam("id") String id, @PathParam("documentId") String documentId);

}
