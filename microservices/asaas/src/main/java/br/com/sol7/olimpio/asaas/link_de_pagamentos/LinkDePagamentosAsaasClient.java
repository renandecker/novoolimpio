package br.com.sol7.olimpio.asaas.link_de_pagamentos;

import br.com.sol7.olimpio.asaas.AsaasAuth;
import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.annotation.ClientHeaderParam;

/**
 * Cliente REST reativo para os endpoints Asaas do grupo "Link de pagamentos" (gerado a partir da
 * collection Postman "Asaas Collection"). Repassa o corpo/consulta como JSON generico
 * (JsonNode) - ver AsaasAuth para o header de autenticacao (access_token).
 */
@RegisterRestClient(configKey = "asaas-api")
@ClientHeaderParam(name = "access_token", value = "{br.com.sol7.olimpio.asaas.AsaasAuth.token}")
public interface LinkDePagamentosAsaasClient {


    // Criar um link de pagamentos (POST /v3/paymentLinks)
    @POST
    @Path("/v3/paymentLinks")
    Uni<JsonNode> criarUmLinkDePagamentos(JsonNode body);


    // Listar links de pagamentos (GET /v3/paymentLinks)
    @GET
    @Path("/v3/paymentLinks")
    Uni<JsonNode> listarLinksDePagamentos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("active") String active, @QueryParam("includeDeleted") String includeDeleted, @QueryParam("name") String name, @QueryParam("externalReference") String externalReference);


    // Atualizar um link de pagamentos (PUT /v3/paymentLinks/:id)
    @PUT
    @Path("/v3/paymentLinks/{id}")
    Uni<JsonNode> atualizarUmLinkDePagamentos(@PathParam("id") String id, JsonNode body);


    // Recuperar um único link de pagamentos (GET /v3/paymentLinks/:id)
    @GET
    @Path("/v3/paymentLinks/{id}")
    Uni<JsonNode> recuperarUmUnicoLinkDePagamentos(@PathParam("id") String id);


    // Remover um link de pagamentos (DELETE /v3/paymentLinks/:id)
    @DELETE
    @Path("/v3/paymentLinks/{id}")
    Uni<JsonNode> removerUmLinkDePagamentos(@PathParam("id") String id);


    // Restaurar um link de pagamentos (POST /v3/paymentLinks/:id/restore)
    @POST
    @Path("/v3/paymentLinks/{id}/restore")
    Uni<JsonNode> restaurarUmLinkDePagamentos(@PathParam("id") String id, JsonNode body);


    // Adicionar uma imagem a um link de pagamentos (POST /v3/paymentLinks/:id/images)
    @POST
    @Path("/v3/paymentLinks/{id}/images")
    Uni<JsonNode> adicionarUmaImagemAUmLinkDePagamentos(@PathParam("id") String id);


    // Listar imagens de um link de pagamentos (GET /v3/paymentLinks/:id/images)
    @GET
    @Path("/v3/paymentLinks/{id}/images")
    Uni<JsonNode> listarImagensDeUmLinkDePagamentos(@PathParam("id") String id);


    // Recuperar uma única imagem do link de pagamentos (GET /v3/paymentLinks/:paymentLinkId/images/:imageId)
    @GET
    @Path("/v3/paymentLinks/{paymentLinkId}/images/{imageId}")
    Uni<JsonNode> recuperarUmaUnicaImagemDoLinkDePagamentos(@PathParam("paymentLinkId") String paymentLinkId, @PathParam("imageId") String imageId);


    // Remover uma imagem do link de pagamentos (DELETE /v3/paymentLinks/:paymentLinkId/images/:imageId)
    @DELETE
    @Path("/v3/paymentLinks/{paymentLinkId}/images/{imageId}")
    Uni<JsonNode> removerUmaImagemDoLinkDePagamentos(@PathParam("paymentLinkId") String paymentLinkId, @PathParam("imageId") String imageId);


    // Definir imagem principal do link de pagamentos (PUT /v3/paymentLinks/:paymentLinkId/images/:imageId/setAsMain)
    @PUT
    @Path("/v3/paymentLinks/{paymentLinkId}/images/{imageId}/setAsMain")
    Uni<JsonNode> definirImagemPrincipalDoLinkDePagamentos(@PathParam("paymentLinkId") String paymentLinkId, @PathParam("imageId") String imageId, JsonNode body);

}
