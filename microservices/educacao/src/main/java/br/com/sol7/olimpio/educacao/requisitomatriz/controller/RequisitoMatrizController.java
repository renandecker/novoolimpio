package br.com.sol7.olimpio.educacao.requisitomatriz;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/educacao/requisito-matriz")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RequisitoMatrizController {
    @Inject
    RequisitoMatrizService service;

    @GET
    public Uni<List<RequisitoMatrizResponse>> list(@QueryParam("curriculoId") Long curriculoId) {
        return curriculoId != null ? service.listarPorCurriculo(curriculoId) : service.list();
    }

    @GET
    @Path("/{id}")
    public Uni<RequisitoMatrizResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid RequisitoMatrizRequest r) {
        return service.create(r).map(item -> Response.ok(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<RequisitoMatrizResponse> update(@PathParam("id") Long id, @Valid RequisitoMatrizRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
