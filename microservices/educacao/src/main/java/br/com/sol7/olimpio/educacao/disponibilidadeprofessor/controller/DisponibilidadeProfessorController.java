package br.com.sol7.olimpio.educacao.disponibilidadeprofessor;

import br.com.sol7.olimpio.educacao.disponibilidadeprofessor.dto.DisponibilidadeProfessorRequest;
import br.com.sol7.olimpio.educacao.disponibilidadeprofessor.dto.DisponibilidadeProfessorResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.educacao.shared.DisponibilidadeScheduleEventResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.time.LocalDate;
import java.util.List;

@Path("/api/educacao/disponibilidade-professor")
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
    public Uni<List<DisponibilidadeScheduleEventResponse>> scheduleEvents(@QueryParam("unidadeId") Long unidadeId, @QueryParam("professorId") Long professorId, @QueryParam("inicio") LocalDate inicio, @QueryParam("fim") LocalDate fim) {
        return service.scheduleEvents(unidadeId, professorId, inicio, fim);
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