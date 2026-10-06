package br.com.sol7.olimpio.biblioteca.exemplar.controller;

import br.com.sol7.olimpio.biblioteca.exemplar.dto.ExemplarRequest;
import br.com.sol7.olimpio.biblioteca.exemplar.dto.ExemplarResponse;
import br.com.sol7.olimpio.biblioteca.exemplar.service.ExemplarService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/biblioteca-fisica/exemplar")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ExemplarController {

    @Inject
    ExemplarService service;

    @GET
    public Uni<PagedResponse<ExemplarResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ExemplarResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<ExemplarResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<ExemplarResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid ExemplarRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ExemplarResponse> atualizar(@PathParam("id") Long id, @Valid ExemplarRequest request) {
        return service.atualizar(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/obra/{obraId}")
    public Uni<List<ExemplarResponse>> buscarPorObra(@PathParam("obraId") Long obraId) {
        return service.buscarPorObra(obraId);
    }

    @GET
    @Path("/obra/{obraId}/disponiveis")
    public Uni<List<ExemplarResponse>> buscarDisponiveisPorObra(@PathParam("obraId") Long obraId) {
        return service.buscarDisponiveisPorObra(obraId);
    }
}