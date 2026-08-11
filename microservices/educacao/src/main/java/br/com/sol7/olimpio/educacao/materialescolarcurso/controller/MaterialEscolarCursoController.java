package br.com.sol7.olimpio.educacao.materialescolarcurso;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.List;

@Path("/api/educacao/material-escolar-curso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MaterialEscolarCursoController {

    @Inject MaterialEscolarCursoService service;

    @GET public Uni<List<MaterialEscolarCursoResponse>> list() { return service.list(); }
    @GET @Path("/paged") public Uni<PagedResponse<MaterialEscolarCursoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) { return service.paged(page == null ? 0 : page, size == null ? 10 : size); }

    @GET
    @Path("/curriculo/{curriculoId}")
    public Uni<List<MaterialEscolarCursoResponse>> listByCurriculo(@PathParam("curriculoId") Long curriculoId) { return service.listByCurriculo(curriculoId); }

    @DELETE
    @Path("/curriculo/{curriculoId}")
    public Uni<Void> deleteByCurriculo(@PathParam("curriculoId") Long curriculoId) { return service.deleteByCurriculo(curriculoId); }

    @GET @Path("/{id}") public Uni<MaterialEscolarCursoResponse> find(@PathParam("id") Long id) { return service.find(id); }
    @POST public Uni<Response> create(@Valid MaterialEscolarCursoRequest r) { return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build()); }
    @PUT @Path("/{id}") public Uni<MaterialEscolarCursoResponse> update(@PathParam("id") Long id, @Valid MaterialEscolarCursoRequest r) { return service.update(id, r); }
    @DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id) { return service.delete(id); }
}
