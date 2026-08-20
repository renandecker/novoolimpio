package br.com.sol7.olimpio.financeiro.impressora;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/impressora")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ImpressoraController {
    @Inject
    ImpressoraService service;

    @GET
    public Uni<List<ImpressoraResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ImpressoraResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ImpressoraResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ImpressoraRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ImpressoraResponse> update(@PathParam("id") Long id, @Valid ImpressoraRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-impressoras-unidade")
    public Uni<Long> buscarImpressorasUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarImpressorasUnidade(unidadeId);
    }


    @GET
    @Path("/verificar-impressoras-com-unidade")
    public Uni<Long> verificarImpressorasComUnidade(@QueryParam("unidadeId") Long unidadeId, @QueryParam("id") Integer id) {
        return service.verificarImpressorasComUnidade(unidadeId, id);
    }

}