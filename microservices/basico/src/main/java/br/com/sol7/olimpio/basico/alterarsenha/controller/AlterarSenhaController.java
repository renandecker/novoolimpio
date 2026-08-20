package br.com.sol7.olimpio.basico.alterarsenha.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.alterarsenha.dto.AlterarSenhaRequest;
import br.com.sol7.olimpio.basico.alterarsenha.dto.AlterarSenhaResponse;
import br.com.sol7.olimpio.basico.alterarsenha.service.AlterarSenhaService;

@Path("/api/basico/alterar-senha")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlterarSenhaController {
    @Inject
    AlterarSenhaService service;

    @GET
    public Uni<List<AlterarSenhaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<AlterarSenhaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<AlterarSenhaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid AlterarSenhaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<AlterarSenhaResponse> update(@PathParam("id") Long id, @Valid AlterarSenhaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}