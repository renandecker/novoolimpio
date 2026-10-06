package br.com.sol7.olimpio.educacao.turma;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/turma")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TurmaController {
    @Inject
    TurmaService service;

    @GET
    public Uni<List<TurmaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TurmaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TurmaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TurmaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TurmaResponse> update(@PathParam("id") Long id, @Valid TurmaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }


    @POST
    @Path("/gerar-documento-troca-turma-todos")
    public Uni<String> gerarDocumentoTrocaTurmaTodos() {
        return service.gerarDocumentoTrocaTurmaTodos();
    }


    @POST
    @Path("/gerar-documento-troca-turma")
    public Uni<String> gerarDocumentoTrocaTurma() {
        return service.gerarDocumentoTrocaTurma();
    }

}
