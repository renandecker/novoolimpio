package br.com.sol7.olimpio.central.coordenador;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/central/coordenador")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CoordenadorController {
    @Inject
    CoordenadorService service;

    @GET
    public Uni<List<CoordenadorResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CoordenadorResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CoordenadorResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CoordenadorRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CoordenadorResponse> update(@PathParam("id") Long id, @Valid CoordenadorRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-coordenador")
    public Uni<List<Long>> autoCompleteCoordenador(@QueryParam("query") String query) {
        return service.autoCompleteCoordenador(query);
    }


    @GET
    @Path("/buscar-ligacoes-prioritarias")
    public Uni<Void> buscarLigacoesPrioritarias() {
        return service.buscarLigacoesPrioritarias();
    }


    @GET
    @Path("/buscar-ligacoes")
    public Uni<Void> buscarLigacoes(@QueryParam("opId") Long opId) {
        return service.buscarLigacoes(opId);
    }

}