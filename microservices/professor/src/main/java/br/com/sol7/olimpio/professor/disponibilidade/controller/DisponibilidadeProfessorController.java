package br.com.sol7.olimpio.professor.disponibilidade.controller;

import br.com.sol7.olimpio.professor.disponibilidade.service.DisponibilidadeProfessorService;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeProfessorRequest;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeProfessorResponse;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeScheduleEventResponse;
import br.com.sol7.olimpio.professor.disponibilidade.dto.DisponibilidadeOpcaoResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.time.LocalDate;
import java.util.List;

@Path("/api/professor/disponibilidade-professor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DisponibilidadeProfessorController {
    @Inject
    DisponibilidadeProfessorService service;

    @GET
    public Uni<List<DisponibilidadeProfessorResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<DisponibilidadeProfessorResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/schedule-events")
    public Uni<List<DisponibilidadeScheduleEventResponse>> scheduleEvents(@QueryParam("professorId") Long professorId, @QueryParam("inicio") LocalDate inicio, @QueryParam("fim") LocalDate fim) {
        return service.scheduleEvents(professorId, inicio, fim);
    }

    @GET
    @Path("/opcoes-professores")
    public Uni<List<DisponibilidadeOpcaoResponse>> opcoesProfessores() {
        return service.opcoesProfessores();
    }

    @GET
    @Path("/{id}")
    public Uni<DisponibilidadeProfessorResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid DisponibilidadeProfessorRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<DisponibilidadeProfessorResponse> update(@PathParam("id") Long id, @Valid DisponibilidadeProfessorRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
