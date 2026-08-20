package br.com.sol7.olimpio.financeiro.sangria.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.financeiro.sangria.service.SangriaService;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaRequest;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaResponse;

@Path("/api/financeiro/sangria")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SangriaController {
    @Inject
    SangriaService service;

    @GET
    public Uni<List<SangriaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<SangriaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<SangriaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @GET
    @Path("/caixa/{caixaId}")
    public Uni<List<SangriaResponse>> buscarPorCaixa(@PathParam("caixaId") Long caixaId) {
        return service.buscarPorCaixa(caixaId);
    }

    @POST
    public Uni<Response> create(@Valid SangriaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<SangriaResponse> update(@PathParam("id") Long id, @Valid SangriaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
