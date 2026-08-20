package br.com.sol7.olimpio.basico.fornecedor.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.fornecedor.dto.FornecedorRequest;
import br.com.sol7.olimpio.basico.fornecedor.dto.FornecedorResponse;
import br.com.sol7.olimpio.basico.fornecedor.service.FornecedorService;

@Path("/api/basico/fornecedor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FornecedorController {
    @Inject
    FornecedorService service;

    @GET
    public Uni<List<FornecedorResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FornecedorResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FornecedorResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FornecedorRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FornecedorResponse> update(@PathParam("id") Long id, @Valid FornecedorRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-pessoa")
    public Uni<List<Long>> autoCompletePessoa(@QueryParam("query") String query) {
        return service.autoCompletePessoa(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-fornecedor")
    public Uni<List<Long>> autoCompleteFornecedor(@QueryParam("query") String query) {
        return service.autoCompleteFornecedor(query);
    }


    @GET
    @Path("/auto-complete2")
    public Uni<List<Long>> autoComplete2(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoComplete2(query, unidades);
    }


    @GET
    @Path("/auto-complete-pessoa2")
    public Uni<List<Long>> autoCompletePessoa2(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompletePessoa2(query, unidades);
    }


    @GET
    @Path("/auto-complete-s-omente-unidade")
    public Uni<List<Long>> autoCompleteSOmenteUnidade(@QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteSOmenteUnidade(unidades);
    }


    @GET
    @Path("/auto-complete-fornecedor2")
    public Uni<List<Long>> autoCompleteFornecedor2(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteFornecedor2(query, unidades);
    }


    @GET
    @Path("/auto-complete-s-omente-unidade-fornecedor")
    public Uni<List<Long>> autoCompleteSOmenteUnidadeFornecedor(@QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteSOmenteUnidadeFornecedor(unidades);
    }

}