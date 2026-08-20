package br.com.sol7.olimpio.educacao.diaaula;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import br.com.sol7.olimpio.educacao.shared.RefOption;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

@Path("/api/educacao/dia-aula")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiaAulaController {

    @Inject
    DiaAulaService service;

    @GET
    public Uni<List<DiaAulaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<DiaAulaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/refs")
    public Uni<Map<String, List<RefOption>>> refs() {
        return service.refs();
    }

    @GET
    @Path("/{id}")
    public Uni<DiaAulaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid DiaAulaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<DiaAulaResponse> update(@PathParam("id") Long id, @Valid DiaAulaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
