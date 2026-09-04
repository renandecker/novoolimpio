package br.com.sol7.olimpio.educacao.matrizcurricular;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/educacao/matriz-curricular")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MatrizCurricularController {
    @Inject
    MatrizCurricularService service;

    @GET
    public Uni<List<MatrizCurricularResponse>> list(@QueryParam("curriculoId") Long curriculoId) {
        return curriculoId != null ? service.listarPorCurriculo(curriculoId) : service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<MatrizCurricularResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<MatrizCurricularResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid MatrizCurricularRequest r) {
        return service.create(r).map(item -> Response.ok(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<MatrizCurricularResponse> update(@PathParam("id") Long id, @Valid MatrizCurricularRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
