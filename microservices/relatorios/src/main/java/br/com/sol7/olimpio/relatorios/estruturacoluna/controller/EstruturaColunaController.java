package br.com.sol7.olimpio.relatorios.estruturacoluna.controller;
import br.com.sol7.olimpio.relatorios.estruturacoluna.dto.EstruturaColunaRequest;
import br.com.sol7.olimpio.relatorios.estruturacoluna.dto.EstruturaColunaResponse;
import br.com.sol7.olimpio.relatorios.estruturacoluna.service.EstruturaColunaService;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/estrutura-coluna")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstruturaColunaController {

    @Inject
    EstruturaColunaService service;

    @GET
    public Uni<List<EstruturaColunaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<EstruturaColunaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<EstruturaColunaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid EstruturaColunaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<EstruturaColunaResponse> update(@PathParam("id") Long id, @Valid EstruturaColunaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}