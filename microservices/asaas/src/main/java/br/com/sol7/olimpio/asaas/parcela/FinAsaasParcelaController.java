package br.com.sol7.olimpio.asaas.parcela;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/asaas/parcelas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FinAsaasParcelaController {

    @Inject
    FinAsaasParcelaService service;

    @GET
    public Uni<List<FinAsaasParcelaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FinAsaasParcelaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FinAsaasParcelaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @GET
    @Path("/asaas-id/{asaasId}")
    public Uni<FinAsaasParcelaResponse> findByAsaasId(@PathParam("asaasId") String asaasId) {
        return service.findByAsaasId(asaasId);
    }

    @POST
    public Uni<Response> create(@Valid FinAsaasParcelaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FinAsaasParcelaResponse> update(@PathParam("id") Long id, @Valid FinAsaasParcelaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
