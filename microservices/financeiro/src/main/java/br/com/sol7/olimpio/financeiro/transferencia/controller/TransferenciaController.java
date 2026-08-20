package br.com.sol7.olimpio.financeiro.transferencia.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.financeiro.transferencia.service.TransferenciaService;
import br.com.sol7.olimpio.financeiro.transferencia.dto.TransferenciaRequest;
import br.com.sol7.olimpio.financeiro.transferencia.dto.TransferenciaResponse;

@Path("/api/financeiro/transferencia")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TransferenciaController {
    @Inject
    TransferenciaService service;

    @GET
    public Uni<List<TransferenciaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TransferenciaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TransferenciaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TransferenciaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TransferenciaResponse> update(@PathParam("id") Long id, @Valid TransferenciaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
