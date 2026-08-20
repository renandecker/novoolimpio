package br.com.sol7.olimpio.educacao.disponibilidadeoferecimentocurso;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import br.com.sol7.olimpio.educacao.shared.DisponibilidadeScheduleEventResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.time.LocalDate;
import java.util.List;

@Path("/api/educacao/disponibilidade-oferecimento-curso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DisponibilidadeOferecimentoCursoController {
    @Inject
    DisponibilidadeOferecimentoCursoService service;

    @GET
    public Uni<List<DisponibilidadeOferecimentoCursoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<DisponibilidadeOferecimentoCursoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/schedule-events")
    public Uni<List<DisponibilidadeScheduleEventResponse>> scheduleEvents(@QueryParam("unidadeId") Long unidadeId, @QueryParam("inicio") LocalDate inicio, @QueryParam("fim") LocalDate fim) {
        return service.scheduleEvents(unidadeId, inicio, fim);
    }

    @GET
    @Path("/{id}")
    public Uni<DisponibilidadeOferecimentoCursoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid DisponibilidadeOferecimentoCursoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<DisponibilidadeOferecimentoCursoResponse> update(@PathParam("id") Long id, @Valid DisponibilidadeOferecimentoCursoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}