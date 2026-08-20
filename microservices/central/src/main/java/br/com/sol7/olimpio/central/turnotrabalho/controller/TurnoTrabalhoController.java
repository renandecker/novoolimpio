package br.com.sol7.olimpio.central.turnotrabalho;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/central/turno-trabalho")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TurnoTrabalhoController {
    @Inject
    TurnoTrabalhoService service;

    @GET
    public Uni<List<TurnoTrabalhoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TurnoTrabalhoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TurnoTrabalhoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TurnoTrabalhoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TurnoTrabalhoResponse> update(@PathParam("id") Long id, @Valid TurnoTrabalhoRequest r) {
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
    @Path("/auto-complete-turno-trabalho")
    public Uni<List<Long>> autoCompleteTurnoTrabalho(@QueryParam("query") String query) {
        return service.autoCompleteTurnoTrabalho(query);
    }


    @GET
    @Path("/buscar-turno-trabalho-com-unidades")
    public Uni<Long> buscarTurnoTrabalhoComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarTurnoTrabalhoComUnidades(entityId);
    }


    @GET
    @Path("/buscar-turnos-da-unidade")
    public Uni<List<Long>> buscarTurnosDaUnidade() {
        return service.buscarTurnosDaUnidade();
    }

}