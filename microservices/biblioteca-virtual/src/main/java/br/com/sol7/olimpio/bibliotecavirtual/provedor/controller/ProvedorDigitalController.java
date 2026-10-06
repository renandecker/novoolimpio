package br.com.sol7.olimpio.bibliotecavirtual.provedor.controller;

import br.com.sol7.olimpio.bibliotecavirtual.provedor.dto.ProvedorDigitalRequest;
import br.com.sol7.olimpio.bibliotecavirtual.provedor.dto.ProvedorDigitalResponse;
import br.com.sol7.olimpio.bibliotecavirtual.provedor.service.ProvedorDigitalService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/biblioteca-virtual/provedor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProvedorDigitalController {

    @Inject
    ProvedorDigitalService service;

    @GET
    public Uni<PagedResponse<ProvedorDigitalResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ProvedorDigitalResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<ProvedorDigitalResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/ativos")
    public Uni<List<ProvedorDigitalResponse>> buscarTodosAtivos() {
        return service.buscarTodosAtivos();
    }

    @GET
    @Path("/{id}")
    public Uni<ProvedorDigitalResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid ProvedorDigitalRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ProvedorDigitalResponse> atualizar(@PathParam("id") Long id, @Valid ProvedorDigitalRequest request) {
        return service.atualizar(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }
}