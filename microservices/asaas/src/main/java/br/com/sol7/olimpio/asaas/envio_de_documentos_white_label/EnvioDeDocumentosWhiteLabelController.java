package br.com.sol7.olimpio.asaas.envio_de_documentos_white_label;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Envio de documentos White Label". So repassa para a API do Asaas (via
 * EnvioDeDocumentosWhiteLabelAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EnvioDeDocumentosWhiteLabelController {

    @Inject
    @RestClient
    EnvioDeDocumentosWhiteLabelAsaasClient client;


    @GET
    @Path("/v3/myAccount/documents")
    public Uni<JsonNode> verificarDocumentosPendentes() {
        return client.verificarDocumentosPendentes();
    }

    @POST
    @Path("/v3/myAccount/documents/{id}")
    public Uni<JsonNode> enviarDocumentosViaApi(@PathParam("id") String id) {
        return client.enviarDocumentosViaApi(id);
    }

    @GET
    @Path("/v3/myAccount/documents/files/{id}")
    public Uni<JsonNode> visualizarDocumentoEnviado(@PathParam("id") String id) {
        return client.visualizarDocumentoEnviado(id);
    }

    @POST
    @Path("/v3/myAccount/documents/files/{id}")
    public Uni<JsonNode> atualizarDocumentoEnviado(@PathParam("id") String id) {
        return client.atualizarDocumentoEnviado(id);
    }

    @DELETE
    @Path("/v3/myAccount/documents/files/{id}")
    public Uni<JsonNode> removerDocumentoEnviado(@PathParam("id") String id) {
        return client.removerDocumentoEnviado(id);
    }
}
