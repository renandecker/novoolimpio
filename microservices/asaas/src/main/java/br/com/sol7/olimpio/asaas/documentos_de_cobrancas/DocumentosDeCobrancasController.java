package br.com.sol7.olimpio.asaas.documentos_de_cobrancas;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Documentos de cobranças". So repassa para a API do Asaas (via
 * DocumentosDeCobrancasAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DocumentosDeCobrancasController {

    @Inject
    @RestClient
    DocumentosDeCobrancasAsaasClient client;


    @POST
    @Path("/v3/payments/{id}/documents")
    public Uni<JsonNode> fazerUploadDeDocumentosDaCobranca(@PathParam("id") String id) {
        return client.fazerUploadDeDocumentosDaCobranca(id);
    }

    @GET
    @Path("/v3/payments/{id}/documents")
    public Uni<JsonNode> listarDocumentosDeUmaCobranca(@PathParam("id") String id) {
        return client.listarDocumentosDeUmaCobranca(id);
    }

    @PUT
    @Path("/v3/payments/{id}/documents/{documentId}")
    public Uni<JsonNode> atualizarDefinicoesDeUmDocumentoDaCobranca(@PathParam("id") String id, @PathParam("documentId") String documentId, JsonNode body) {
        return client.atualizarDefinicoesDeUmDocumentoDaCobranca(id, documentId, body);
    }

    @GET
    @Path("/v3/payments/{id}/documents/{documentId}")
    public Uni<JsonNode> recuperarUmUnicoDocumentoDaCobranca(@PathParam("id") String id, @PathParam("documentId") String documentId) {
        return client.recuperarUmUnicoDocumentoDaCobranca(id, documentId);
    }

    @DELETE
    @Path("/v3/payments/{id}/documents/{documentId}")
    public Uni<JsonNode> excluirDocumentoDeUmaCobranca(@PathParam("id") String id, @PathParam("documentId") String documentId) {
        return client.excluirDocumentoDeUmaCobranca(id, documentId);
    }
}
