package br.com.sol7.olimpio.notificacoes.notificacao.controller;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoRequest;
import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoResponse;
import br.com.sol7.olimpio.notificacoes.notificacao.service.NotificacaoService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/notificacoes/notificacao") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON)
public class NotificacaoController {

    @Inject NotificacaoService service;

    private String currentUser(@HeaderParam("X-Authenticated-Username") String username) {
        return username == null ? "admin" : username;
    }

    @GET
    public Uni<List<NotificacaoResponse>> list() { return service.list(); }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<NotificacaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/minhas")
    public Uni<PagedResponse<NotificacaoResponse>> minhas(@HeaderParam("X-Authenticated-Username") String username, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.minhas(currentUser(username), page == null ? 0 : page, size == null ? 20 : size);
    }

    @GET
    @Path("/nao-lidas")
    public Uni<Long> naoLidas(@HeaderParam("X-Authenticated-Username") String username) {
        return service.naoLidas(currentUser(username));
    }

    @GET
    @Path("/{id}")
    public Uni<NotificacaoResponse> find(@PathParam("id") Long id) { return service.find(id); }

    @POST
    public Uni<Response> create(@Valid NotificacaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<NotificacaoResponse> update(@PathParam("id") Long id, @Valid NotificacaoRequest r) { return service.update(id, r); }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) { return service.delete(id); }

    @POST
    @Path("/{id}/ler")
    public Uni<NotificacaoResponse> marcarLida(@PathParam("id") Long id, @HeaderParam("X-Authenticated-Username") String username) {
        return service.marcarLida(id, currentUser(username));
    }
}
