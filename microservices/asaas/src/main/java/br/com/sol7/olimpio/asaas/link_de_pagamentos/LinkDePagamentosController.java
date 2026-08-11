package br.com.sol7.olimpio.asaas.link_de_pagamentos;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Endpoints do asaas para o grupo Asaas "Link de pagamentos". So repassa para a API do Asaas (via
 * LinkDePagamentosAsaasClient) - o access_token real do Asaas fica so aqui no servidor (ver AsaasAuth),
 * nunca precisa ser conhecido por quem chama o asaas.
 */
@Path("/api/asaas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LinkDePagamentosController {

    @Inject
    @RestClient
    LinkDePagamentosAsaasClient client;


    @POST
    @Path("/v3/paymentLinks")
    public Uni<JsonNode> criarUmLinkDePagamentos(JsonNode body) {
        return client.criarUmLinkDePagamentos(body);
    }

    @GET
    @Path("/v3/paymentLinks")
    public Uni<JsonNode> listarLinksDePagamentos(@QueryParam("offset") String offset, @QueryParam("limit") String limit, @QueryParam("active") String active, @QueryParam("includeDeleted") String includeDeleted, @QueryParam("name") String name, @QueryParam("externalReference") String externalReference) {
        return client.listarLinksDePagamentos(offset, limit, active, includeDeleted, name, externalReference);
    }

    @PUT
    @Path("/v3/paymentLinks/{id}")
    public Uni<JsonNode> atualizarUmLinkDePagamentos(@PathParam("id") String id, JsonNode body) {
        return client.atualizarUmLinkDePagamentos(id, body);
    }

    @GET
    @Path("/v3/paymentLinks/{id}")
    public Uni<JsonNode> recuperarUmUnicoLinkDePagamentos(@PathParam("id") String id) {
        return client.recuperarUmUnicoLinkDePagamentos(id);
    }

    @DELETE
    @Path("/v3/paymentLinks/{id}")
    public Uni<JsonNode> removerUmLinkDePagamentos(@PathParam("id") String id) {
        return client.removerUmLinkDePagamentos(id);
    }

    @POST
    @Path("/v3/paymentLinks/{id}/restore")
    public Uni<JsonNode> restaurarUmLinkDePagamentos(@PathParam("id") String id, JsonNode body) {
        return client.restaurarUmLinkDePagamentos(id, body);
    }

    @POST
    @Path("/v3/paymentLinks/{id}/images")
    public Uni<JsonNode> adicionarUmaImagemAUmLinkDePagamentos(@PathParam("id") String id) {
        return client.adicionarUmaImagemAUmLinkDePagamentos(id);
    }

    @GET
    @Path("/v3/paymentLinks/{id}/images")
    public Uni<JsonNode> listarImagensDeUmLinkDePagamentos(@PathParam("id") String id) {
        return client.listarImagensDeUmLinkDePagamentos(id);
    }

    @GET
    @Path("/v3/paymentLinks/{paymentLinkId}/images/{imageId}")
    public Uni<JsonNode> recuperarUmaUnicaImagemDoLinkDePagamentos(@PathParam("paymentLinkId") String paymentLinkId, @PathParam("imageId") String imageId) {
        return client.recuperarUmaUnicaImagemDoLinkDePagamentos(paymentLinkId, imageId);
    }

    @DELETE
    @Path("/v3/paymentLinks/{paymentLinkId}/images/{imageId}")
    public Uni<JsonNode> removerUmaImagemDoLinkDePagamentos(@PathParam("paymentLinkId") String paymentLinkId, @PathParam("imageId") String imageId) {
        return client.removerUmaImagemDoLinkDePagamentos(paymentLinkId, imageId);
    }

    @PUT
    @Path("/v3/paymentLinks/{paymentLinkId}/images/{imageId}/setAsMain")
    public Uni<JsonNode> definirImagemPrincipalDoLinkDePagamentos(@PathParam("paymentLinkId") String paymentLinkId, @PathParam("imageId") String imageId, JsonNode body) {
        return client.definirImagemPrincipalDoLinkDePagamentos(paymentLinkId, imageId, body);
    }
}
