package br.com.sol7.olimpio.educacao.materialescolarmatricula;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.List;

@Path("/api/educacao/material-escolar-matricula")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MaterialEscolarMatriculaController {

    @Inject MaterialEscolarMatriculaService service;

    @GET public Uni<List<MaterialEscolarMatriculaResponse>> list() { return service.list(); }
    @GET @Path("/paged") public Uni<PagedResponse<MaterialEscolarMatriculaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) { return service.paged(page == null ? 0 : page, size == null ? 10 : size); }

    @GET
    @Path("/matricula/{matriculaId}")
    public Uni<List<MaterialEscolarMatriculaResponse>> listByMatricula(@PathParam("matriculaId") Long matriculaId) { return service.listByMatricula(matriculaId); }

    @DELETE
    @Path("/matricula/{matriculaId}")
    public Uni<Void> deleteByMatricula(@PathParam("matriculaId") Long matriculaId) { return service.deleteByMatricula(matriculaId); }

    @GET @Path("/{id}") public Uni<MaterialEscolarMatriculaResponse> find(@PathParam("id") Long id) { return service.find(id); }
    @POST public Uni<Response> create(@Valid MaterialEscolarMatriculaRequest r) { return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build()); }
    @PUT @Path("/{id}") public Uni<MaterialEscolarMatriculaResponse> update(@PathParam("id") Long id, @Valid MaterialEscolarMatriculaRequest r) { return service.update(id, r); }
    @DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id) { return service.delete(id); }
}

