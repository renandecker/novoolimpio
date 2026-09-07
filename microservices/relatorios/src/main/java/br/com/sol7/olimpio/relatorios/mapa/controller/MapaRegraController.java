package br.com.sol7.olimpio.relatorios.mapa;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/relatorios/mapa-regra")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MapaRegraController {

    @Inject
    MapaRegraService service;

    @GET
    @Path("/mapa/{mapaId}")
    public Uni<List<MapaRegraResponse>> findByMapaId(@PathParam("mapaId") Long mapaId) {
        return service.findByMapaId(mapaId);
    }

    @POST
    public Uni<Response> create(@Valid MapaRegraRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}