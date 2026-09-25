package br.com.sol7.olimpio.notificacoes.notificacao.controller;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoCategoriaResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoUsuarioRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.PreferenciaNotificacaoUsuarioResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.service.PreferenciaNotificacaoUsuarioService;
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

@Path("/api/notificacoes/preferencias")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PreferenciaNotificacaoUsuarioController {

    @Inject
    PreferenciaNotificacaoUsuarioService service;

    @GET
    @Path("/minhas")
    public Uni<List<PreferenciaNotificacaoUsuarioResponse>> minhas(@QueryParam("username") String username) {
        return service.listByUsername(username == null || username.isBlank() ? "admin" : username);
    }

    @GET
    @Path("/minhas/agrupadas")
    public Uni<List<PreferenciaNotificacaoCategoriaResponse>> minhasAgrupadas(@QueryParam("username") String username) {
        return service.listGroupedByUsername(username == null || username.isBlank() ? "admin" : username);
    }

    @POST
    public Uni<Response> createOrUpdate(@Valid PreferenciaNotificacaoUsuarioRequest request) {
        return service.createOrUpdate(request)
                .map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<PreferenciaNotificacaoUsuarioResponse> update(@PathParam("id") Long id, @Valid PreferenciaNotificacaoUsuarioRequest request) {
        return service.update(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @DELETE
    @Path("/usuario/{username}")
    public Uni<Void> deleteByUsername(@PathParam("username") String username) {
        return service.deleteByUsername(username);
    }

    @POST
    @Path("/inicializar/{username}")
    public Uni<Response> inicializarDefaults(@PathParam("username") String username) {
        return service.initializeDefaultsForUser(username)
                .replaceWith(Response.ok().build());
    }
}