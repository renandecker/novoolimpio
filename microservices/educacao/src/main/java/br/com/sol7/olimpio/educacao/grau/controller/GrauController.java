package br.com.sol7.olimpio.educacao.grau;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/grau")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GrauController {
    @Inject
    GrauService service;

    @GET
    public Uni<List<GrauResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<GrauResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<GrauResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid GrauRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<GrauResponse> update(@PathParam("id") Long id, @Valid GrauRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-grau-com-nota")
    public Uni<Long> buscarGrauComNota(@QueryParam("grauId") Long grauId) {
        return service.buscarGrauComNota(grauId);
    }


    @GET
    @Path("/buscar-grau-com-conceito")
    public Uni<Long> buscarGrauComConceito(@QueryParam("grauId") Long grauId) {
        return service.buscarGrauComConceito(grauId);
    }

}
