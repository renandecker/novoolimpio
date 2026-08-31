package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
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
import java.util.Map;

@Path("/api/curriculo/curriculo-trabalho")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CurriculoTrabalhoController {

    @Inject
    CurriculoTrabalhoService service;

    @GET
    public Uni<List<CurriculoTrabalhoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CurriculoTrabalhoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/refs")
    public Uni<Map<String, List<RefOption>>> refs() {
        return service.refs();
    }

    @GET
    @Path("/{id}")
    public Uni<CurriculoTrabalhoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CurriculoTrabalhoRequest request) {
        return service.create(request)
                .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CurriculoTrabalhoResponse> update(@PathParam("id") Long id, @Valid CurriculoTrabalhoRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @PUT
    @Path("/{id}/curriculo-base64")
    public Uni<CurriculoTrabalhoResponse> atualizarCurriculoBase64(@PathParam("id") Long id, String curriculoBase64) {
        return service.atualizarCurriculoBase64(id, curriculoBase64);
    }
}
