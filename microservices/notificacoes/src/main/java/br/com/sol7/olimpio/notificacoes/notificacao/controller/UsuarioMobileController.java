package br.com.sol7.olimpio.notificacoes.notificacao.controller;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.UsuarioMobileRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.UsuarioMobileResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.service.UsuarioMobileService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/notificacoes/mobile/tokens")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UsuarioMobileController {

    @Inject
    UsuarioMobileService service;

    @GET
    @Path("/usuario/{idUsuario}")
    @RolesAllowed({"admin", "user"})
    public Uni<List<UsuarioMobileResponse>> listByUsuario(@PathParam("idUsuario") Integer idUsuario) {
        return service.listByUsuario(idUsuario);
    }

    @GET
    @Path("/usuario/{idUsuario}/paged")
    @RolesAllowed({"admin", "user"})
    public Uni<PagedResponse<UsuarioMobileResponse>> pagedByUsuario(
            @PathParam("idUsuario") Integer idUsuario,
            @QueryParam("page") int page,
            @QueryParam("size") int size) {
        return service.pagedByUsuario(idUsuario, page, size);
    }

    @POST
    @Path("/usuario/{idUsuario}")
    @RolesAllowed({"admin", "user"})
    public Uni<UsuarioMobileResponse> registrarOuAtualizar(@PathParam("idUsuario") Integer idUsuario, UsuarioMobileRequest request) {
        return service.registrarOuAtualizar(idUsuario, request);
    }

    @DELETE
    @Path("/usuario/{idUsuario}/{token}")
    @RolesAllowed({"admin", "user"})
    public Uni<Response> desativar(@PathParam("idUsuario") Integer idUsuario, @PathParam("token") String token) {
        return service.desativar(idUsuario, token)
                .replaceWith(Response.noContent()::build);
    }

    @DELETE
    @Path("/usuario/{idUsuario}")
    @RolesAllowed({"admin", "user"})
    public Uni<Response> desativarTodos(@PathParam("idUsuario") Integer idUsuario) {
        return service.desativarTodosDoUsuario(idUsuario)
                .replaceWith(Response.noContent()::build);
    }
}