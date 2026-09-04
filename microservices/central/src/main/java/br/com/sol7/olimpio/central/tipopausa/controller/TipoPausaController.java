package br.com.sol7.olimpio.central.tipopausa;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/central/tipo-pausa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TipoPausaController {
    @Inject
    TipoPausaService service;

    @GET
    public Uni<List<TipoPausaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TipoPausaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TipoPausaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TipoPausaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TipoPausaResponse> update(@PathParam("id") Long id, @Valid TipoPausaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<TipoPausaResponse>> search(SearchFilterRequest request,
            @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.search(request, page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/all")
    public Uni<List<TipoPausaResponse>> all() {
        return service.list();
    }

}