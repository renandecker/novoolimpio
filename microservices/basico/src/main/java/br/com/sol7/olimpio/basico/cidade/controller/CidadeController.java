package br.com.sol7.olimpio.basico.cidade.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.cidade.dto.CidadeRequest;
import br.com.sol7.olimpio.basico.cidade.dto.CidadeResponse;
import br.com.sol7.olimpio.basico.cidade.service.CidadeService;

@Path("/api/basico/cidade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CidadeController {
    @Inject
    CidadeService service;

    @GET
    public Uni<List<CidadeResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CidadeResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CidadeResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CidadeRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CidadeResponse> update(@PathParam("id") Long id, @Valid CidadeRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-logradouro-troca")
    public Uni<List<Long>> autoCompleteLogradouroTroca(@QueryParam("query") String query) {
        return service.autoCompleteLogradouroTroca(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-com-cep")
    public Uni<List<Long>> autoCompleteComCep(@QueryParam("query") String query, @QueryParam("cep") String cep) {
        return service.autoCompleteComCep(query, cep);
    }


    @GET
    @Path("/auto-complete-com-estado")
    public Uni<List<Long>> autoCompleteComEstado(@QueryParam("query") String query, @QueryParam("estadoId") Long estadoId) {
        return service.autoCompleteComEstado(query, estadoId);
    }


    @GET
    @Path("/auto-complete-com-estado-com-cep")
    public Uni<List<Long>> autoCompleteComEstadoComCep(@QueryParam("query") String query, @QueryParam("estadoId") Long estadoId, @QueryParam("cep") String cep) {
        return service.autoCompleteComEstadoComCep(query, estadoId, cep);
    }

}