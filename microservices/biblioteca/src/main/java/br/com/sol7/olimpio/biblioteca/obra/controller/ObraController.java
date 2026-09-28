package br.com.sol7.olimpio.biblioteca.obra.controller;

import br.com.sol7.olimpio.biblioteca.obra.dto.ObraRequest;
import br.com.sol7.olimpio.biblioteca.obra.dto.ObraResponse;
import br.com.sol7.olimpio.biblioteca.obra.service.ObraService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.action.GenericActionController;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/biblioteca-fisica/obra")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ObraController extends GenericActionController {

    @Inject
    ObraService service;

    @GET
    public Uni<PagedResponse<ObraResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<ObraResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<ObraResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid ObraRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ObraResponse> atualizar(@PathParam("id") Long id, @Valid ObraRequest request) {
        return service.atualizar(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/busca/titulo")
    public Uni<List<ObraResponse>> buscarPorTitulo(@QueryParam("q") String titulo) {
        return service.buscarPorTitulo(titulo);
    }

    @GET
    @Path("/busca/isbn")
    public Uni<List<ObraResponse>> buscarPorIsbn(@QueryParam("isbn") String isbn) {
        return service.buscarPorIsbn(isbn);
    }
}