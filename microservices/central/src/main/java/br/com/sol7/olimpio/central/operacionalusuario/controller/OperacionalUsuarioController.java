package br.com.sol7.olimpio.central.operacionalusuario;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/central/operacional-usuario")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OperacionalUsuarioController {

    @Inject
    OperacionalUsuarioService service;

    @GET
    @Path("/operacional/{operacionalId}")
    public Uni<List<OperacionalUsuarioResponse>> listByOperacionalId(@PathParam("operacionalId") Long operacionalId) {
        return service.listByOperacionalId(operacionalId);
    }

    @POST
    public Uni<Response> create(@Valid OperacionalUsuarioRequest request) {
        return service.create(request)
                .map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @DELETE
    @Path("/operacional/{operacionalId}/usuario/{usuarioId}")
    public Uni<Void> delete(@PathParam("operacionalId") Long operacionalId, @PathParam("usuarioId") Long usuarioId) {
        return service.deleteByOperacionalIdAndUsuarioId(operacionalId, usuarioId);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<OperacionalUsuarioResponse>> search(SearchFilterRequest request,
            @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.search(request, page == null ? 0 : page, size == null ? 10 : size);
    }
}