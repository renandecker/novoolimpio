package br.com.sol7.olimpio.basico.rede.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.rede.dto.RedeRequest;
import br.com.sol7.olimpio.basico.rede.dto.RedeResponse;
import br.com.sol7.olimpio.basico.rede.service.RedeService;

@Path("/api/basico/rede")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RedeController {
    @Inject
    RedeService service;

    @GET
    public Uni<List<RedeResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<RedeResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<RedeResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid RedeRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<RedeResponse> update(@PathParam("id") Long id, @Valid RedeRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/atualizar-usuario")
    public Uni<Void> atualizarUsuario(@QueryParam("event") String event) {
        return service.atualizarUsuario(event);
    }


    @GET
    @Path("/buscar-detalhes")
    public Uni<Void> buscarDetalhes(@QueryParam("event") String event) {
        return service.buscarDetalhes(event);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

}