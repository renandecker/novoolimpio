package br.com.sol7.olimpio.basico.estadocivil.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.estadocivil.dto.EstadoCivilRequest;
import br.com.sol7.olimpio.basico.estadocivil.dto.EstadoCivilResponse;
import br.com.sol7.olimpio.basico.estadocivil.service.EstadoCivilService;

@Path("/api/basico/estado-civil")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstadoCivilController {
    @Inject
    EstadoCivilService service;

    @GET
    public Uni<List<EstadoCivilResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<EstadoCivilResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<EstadoCivilResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid EstadoCivilRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<EstadoCivilResponse> update(@PathParam("id") Long id, @Valid EstadoCivilRequest r) {
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
    @Path("/auto-complete2")
    public Uni<List<Long>> autoComplete2() {
        return service.autoComplete2();
    }

}