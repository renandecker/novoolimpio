package br.com.sol7.olimpio.relatorios.estrutura.controller;
import br.com.sol7.olimpio.relatorios.estrutura.dto.EstruturaRequest;
import br.com.sol7.olimpio.relatorios.estrutura.dto.EstruturaResponse;
import br.com.sol7.olimpio.relatorios.estrutura.service.EstruturaService;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/estrutura")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstruturaController {
    @Inject
    EstruturaService service;

    @GET
    public Uni<List<EstruturaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<EstruturaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<EstruturaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid EstruturaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<EstruturaResponse> update(@PathParam("id") Long id, @Valid EstruturaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-bancos")
    public Uni<List<Long>> buscarBancos(@QueryParam("banco") String banco) {
        return service.buscarBancos(banco);
    }


    @GET
    @Path("/buscar-bancos-com-id")
    public Uni<List<Long>> buscarBancosComId(@QueryParam("banco") String banco, @QueryParam("id") Long id) {
        return service.buscarBancosComId(banco, id);
    }

}