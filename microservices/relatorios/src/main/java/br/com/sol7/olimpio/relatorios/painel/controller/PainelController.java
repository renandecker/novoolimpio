package br.com.sol7.olimpio.relatorios.painel.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.relatorios.painel.service.PainelService;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelPermissaoRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelFiltrosRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/painel")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PainelController {
    @Inject
    PainelService service;

    @GET
    public Uni<List<PainelResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<PainelResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<PainelResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid PainelRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<PainelResponse> update(@PathParam("id") Long id, @Valid PainelRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @PUT
    @Path("/{id}/permissoes")
    public Uni<PainelResponse> updatePermissoes(@PathParam("id") Long id, PainelPermissaoRequest r) {
        return service.updatePermissoes(id, r);
    }

    @GET
    @Path("/{id}/filtros")
    public Uni<List<Long>> listarFiltros(@PathParam("id") Long id) {
        return service.listarFiltros(id);
    }

    @PUT
    @Path("/{id}/filtros")
    public Uni<PainelResponse> updateFiltros(@PathParam("id") Long id, PainelFiltrosRequest r) {
        return service.updateFiltros(id, r);
    }

    @GET
    @Path("/buscar-unidades")
    public Uni<List<Long>> buscarUnidades(@QueryParam("id") Long id) {
        return service.buscarUnidades(id);
    }


    @GET
    @Path("/buscar-perfils")
    public Uni<List<Long>> buscarPerfils(@QueryParam("id") Long id) {
        return service.buscarPerfils(id);
    }


    @GET
    @Path("/buscar-usuarios")
    public Uni<List<Long>> buscarUsuarios(@QueryParam("id") Long id) {
        return service.buscarUsuarios(id);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query, @QueryParam("estruturaId") Long estruturaId) {
        return service.autoComplete(query, estruturaId);
    }

}