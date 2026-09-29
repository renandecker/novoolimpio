package br.com.sol7.olimpio.bibliotecavirtual.livrodigital.controller;

import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto.LivroDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.dto.LivroDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.livrodigital.service.LivroDigitalService;
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

@Path("/api/biblioteca-virtual/livro-digital")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LivroDigitalController extends GenericActionController {

    @Inject
    LivroDigitalService service;

    @GET
    public Uni<PagedResponse<LivroDigitalResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<LivroDigitalResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<LivroDigitalResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<LivroDigitalResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid LivroDigitalRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<LivroDigitalResponse> atualizar(@PathParam("id") Long id, @Valid LivroDigitalRequest request) {
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
    public Uni<List<LivroDigitalResponse>> buscarPorTitulo(@QueryParam("q") String titulo) {
        return service.buscarPorTitulo(titulo);
    }
}