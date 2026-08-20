package br.com.sol7.olimpio.basico.gestaocontas.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.gestaocontas.dto.GestaoContasRequest;
import br.com.sol7.olimpio.basico.gestaocontas.dto.GestaoContasResponse;
import br.com.sol7.olimpio.basico.gestaocontas.service.GestaoContasService;

@Path("/api/basico/gestao-contas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GestaoContasController {
    @Inject
    GestaoContasService service;

    @GET
    public Uni<List<GestaoContasResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<GestaoContasResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<GestaoContasResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid GestaoContasRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<GestaoContasResponse> update(@PathParam("id") Long id, @Valid GestaoContasRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/verificar-acesso")
    public Uni<Boolean> verificarAcesso(@QueryParam("tipo") String tipo, @QueryParam("modulo") String modulo) {
        return service.verificarAcesso(tipo, modulo);
    }


    @POST
    @Path("/ajustar-situacao")
    public Uni<Void> ajustarSituacao(@QueryParam("contaId") Long contaId) {
        return service.ajustarSituacao(contaId);
    }


    @GET
    @Path("/auto-complete-dia-semana")
    public Uni<List<Long>> autoCompleteDiaSemana(@QueryParam("query") String query) {
        return service.autoCompleteDiaSemana(query);
    }

}