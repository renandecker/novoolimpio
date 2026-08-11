package br.com.sol7.olimpio.curriculo.configuracao;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/curriculo/configuracao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ConfiguracaoController {

    @Inject
    ConfiguracaoService service;

    @GET
    public Uni<List<ConfiguracaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ConfiguracaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ConfiguracaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ConfiguracaoRequest request) {
        return service.create(request)
                .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ConfiguracaoResponse> update(@PathParam("id") Long id, @Valid ConfiguracaoRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
