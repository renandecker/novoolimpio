package br.com.sol7.olimpio.basico.agenda.controller;

import br.com.sol7.olimpio.shared.PagedResponse;

import br.com.sol7.olimpio.basico.agenda.dto.*;
import br.com.sol7.olimpio.basico.usuarioperfil.repository.UsuarioPerfilRepository;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.agenda.dto.AgendaRequest;
import br.com.sol7.olimpio.basico.agenda.dto.AgendaResponse;
import br.com.sol7.olimpio.basico.agenda.service.AgendaService;

@Path("/api/basico/agenda")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AgendaController {
    @Inject
    AgendaService service;

    @GET
    public Uni<List<AgendaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<AgendaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<AgendaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid AgendaRequest request) {
        return service.create(request).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<AgendaResponse> update(@PathParam("id") Long id, @Valid AgendaRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }


    @GET
    @Path("/carregar-usuarios")
    public Uni<Void> carregarUsuarios(@QueryParam("agendaId") Long agendaId) {
        return service.carregarUsuarios(agendaId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-agendas-por-unidade")
    public Uni<List<Long>> buscarAgendasPorUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarAgendasPorUnidade(unidadeId);
    }


    @GET
    @Path("/buscar-agenda-com-resultados")
    public Uni<Long> buscarAgendaComResultados(@QueryParam("id") Long id) {
        return service.buscarAgendaComResultados(id);
    }


    @GET
    @Path("/buscar-agenda-com-status")
    public Uni<Long> buscarAgendaComStatus(@QueryParam("id") Long id) {
        return service.buscarAgendaComStatus(id);
    }


    @GET
    @Path("/buscar-agendas-do-usuario")
    public Uni<Boolean> buscarAgendasDoUsuario(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarAgendasDoUsuario(usuarioId);
    }


    @GET
    @Path("/auto-complete-all")
    public Uni<List<Long>> autoCompleteAll() {
        return service.autoCompleteAll();
    }


    @GET
    @Path("/auto-complete-com-usuario")
    public Uni<List<Long>> autoCompleteComUsuario(@QueryParam("query") String query, @QueryParam("usuarioId") Long usuarioId) {
        return service.autoCompleteComUsuario(query, usuarioId);
    }


    @GET
    @Path("/auto-complete-do-usuario")
    public Uni<List<Long>> autoCompleteDoUsuario(@QueryParam("usuarioId") Long usuarioId) {
        return service.autoCompleteDoUsuario(usuarioId);
    }


    @GET
    @Path("/auto-complete-estrategico-com-usuario")
    public Uni<List<Long>> autoCompleteEstrategicoComUsuario(@QueryParam("query") String query, @QueryParam("usuarioId") Long usuarioId) {
        return service.autoCompleteEstrategicoComUsuario(query, usuarioId);
    }


    @GET
    @Path("/auto-complete-estrategico-do-usuario")
    public Uni<List<Long>> autoCompleteEstrategicoDoUsuario(@QueryParam("usuarioId") Long usuarioId) {
        return service.autoCompleteEstrategicoDoUsuario(usuarioId);
    }

}
