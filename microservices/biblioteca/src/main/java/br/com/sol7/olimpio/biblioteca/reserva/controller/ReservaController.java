package br.com.sol7.olimpio.biblioteca.reserva.controller;

import br.com.sol7.olimpio.biblioteca.reserva.dto.ReservaRequest;
import br.com.sol7.olimpio.biblioteca.reserva.dto.ReservaResponse;
import br.com.sol7.olimpio.biblioteca.reserva.service.ReservaService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.List;

@Path("/api/biblioteca-fisica/reserva")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReservaController {

    @Inject
    ReservaService service;

    @GET
    public Uni<PagedResponse<ReservaResponse>> listar(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ReservaResponse>> paged(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(null, page, size);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<ReservaResponse>> search(SearchFilterRequest request,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        return service.listar(request, page, size);
    }

    @GET
    @Path("/{id}")
    public Uni<ReservaResponse> buscarPorId(@PathParam("id") Long id) {
        return service.buscarPorId(id);
    }

    @POST
    public Uni<Response> criar(@Valid ReservaRequest request) {
        return service.criar(request)
                .onItem().transform(resp -> Response.status(Response.Status.CREATED).entity(resp).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ReservaResponse> atualizar(@PathParam("id") Long id, @Valid ReservaRequest request) {
        return service.atualizar(id, request);
    }

    @PUT
    @Path("/{id}/disponibilizar")
    public Uni<ReservaResponse> disponibilizarParaRetirada(
            @PathParam("id") Long id,
            @QueryParam("dataLimiteRetirada") LocalDateTime dataLimiteRetirada) {
        return service.disponibilizarParaRetirada(id, dataLimiteRetirada);
    }

    @PUT
    @Path("/{id}/concluir")
    public Uni<ReservaResponse> concluir(@PathParam("id") Long id) {
        return service.concluir(id);
    }

    @PUT
    @Path("/{id}/cancelar")
    public Uni<ReservaResponse> cancelar(@PathParam("id") Long id, @QueryParam("motivo") String motivo) {
        return service.cancelar(id, motivo);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Response> excluir(@PathParam("id") Long id) {
        return service.excluir(id)
                .onItem().transform(v -> Response.noContent().build());
    }

    @GET
    @Path("/usuario/{usuarioId}")
    public Uni<List<ReservaResponse>> buscarPorUsuario(@PathParam("usuarioId") Long usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/obra/{obraId}")
    public Uni<List<ReservaResponse>> buscarPorObra(@PathParam("obraId") Long obraId) {
        return service.buscarPorObra(obraId);
    }
}