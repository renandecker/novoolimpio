package br.com.sol7.olimpio.biblioteca.multa.controller;

import br.com.sol7.olimpio.biblioteca.multa.dto.MultaRequest;
import br.com.sol7.olimpio.biblioteca.multa.dto.MultaResponse;
import br.com.sol7.olimpio.biblioteca.multa.entity.Multa;
import br.com.sol7.olimpio.biblioteca.multa.service.MultaService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/biblioteca-fisica/multa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MultaController {

    @Inject
    MultaService service;

    @GET
    public Uni<PagedResponse<MultaResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<MultaResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<MultaResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<MultaResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid MultaRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}/pagar")
    public Uni<MultaResponse> pagar(
            @PathParam("id") Long id,
            @QueryParam("formaPagamento") Multa.FormaPagamento formaPagamento) {
        return service.pagar(id, formaPagamento);
    }

    @PUT
    @Path("/{id}/isentar")
    public Uni<MultaResponse> isentar(
            @PathParam("id") Long id,
            @QueryParam("observacoes") String observacoes) {
        return service.isentar(id, observacoes);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/usuario/{usuarioId}")
    public Uni<List<MultaResponse>> buscarPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/usuario/{usuarioId}/pendentes")
    public Uni<List<MultaResponse>> buscarPendentesPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPendentesPorUsuario(usuarioId);
    }
}