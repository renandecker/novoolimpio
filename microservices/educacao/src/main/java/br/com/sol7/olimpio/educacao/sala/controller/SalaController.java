package br.com.sol7.olimpio.educacao.sala;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/sala")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SalaController {
    @Inject
    SalaService service;

    @GET
    public Uni<List<SalaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<SalaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<SalaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid SalaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<SalaResponse> update(@PathParam("id") Long id, @Valid SalaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/ajustar-todos-oferecimentos")
    public Uni<String> ajustarTodosOferecimentos() {
        return service.ajustarTodosOferecimentos();
    }


    @POST
    @Path("/ajustar-marcados-oferecimentos")
    public Uni<String> ajustarMarcadosOferecimentos() {
        return service.ajustarMarcadosOferecimentos();
    }


    @POST
    @Path("/ajustar-nenhum")
    public Uni<String> ajustarNenhum() {
        return service.ajustarNenhum();
    }


    @GET
    @Path("/buscar-salas-da-unidade")
    public Uni<List<Long>> buscarSalasDaUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarSalasDaUnidade(unidadeId);
    }

}
