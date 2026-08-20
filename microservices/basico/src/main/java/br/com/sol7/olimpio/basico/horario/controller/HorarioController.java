package br.com.sol7.olimpio.basico.horario.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.basico.horario.dto.HorarioRequest;
import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;
import br.com.sol7.olimpio.basico.horario.service.HorarioService;

@Path("/api/basico/horario")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HorarioController {
    @Inject
    HorarioService service;

    @GET
    public Uni<List<HorarioResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<HorarioResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<HorarioResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid HorarioRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<HorarioResponse> update(@PathParam("id") Long id, @Valid HorarioRequest r) {
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
    @Path("/buscar-horario-por-hora")
    public Uni<Long> buscarHorarioPorHora(@QueryParam("hora") String hora) {
        return service.buscarHorarioPorHora(hora);
    }


    @GET
    @Path("/buscar-horarios-prenchidos")
    public Uni<List<Long>> buscarHorariosPrenchidos(@QueryParam("agendaId") Long agendaId, @QueryParam("data") Date data) {
        return service.buscarHorariosPrenchidos(agendaId, data);
    }

}