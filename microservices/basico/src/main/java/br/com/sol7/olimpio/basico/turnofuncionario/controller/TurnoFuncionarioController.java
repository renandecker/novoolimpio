package br.com.sol7.olimpio.basico.turnofuncionario.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.turnofuncionario.dto.TurnoFuncionarioRequest;
import br.com.sol7.olimpio.basico.turnofuncionario.dto.TurnoFuncionarioResponse;
import br.com.sol7.olimpio.basico.turnofuncionario.service.TurnoFuncionarioService;

@Path("/api/basico/turno-funcionario")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TurnoFuncionarioController {
    @Inject
    TurnoFuncionarioService service;

    @GET
    public Uni<List<TurnoFuncionarioResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TurnoFuncionarioResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TurnoFuncionarioResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TurnoFuncionarioRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TurnoFuncionarioResponse> update(@PathParam("id") Long id, @Valid TurnoFuncionarioRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}