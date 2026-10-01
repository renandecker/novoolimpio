package br.com.sol7.olimpio.basico.comunicacao.controller;

import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoRequest;
import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoResponse;
import br.com.sol7.olimpio.basico.comunicacao.service.ComunicacaoService;
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

@Path("/api/basico/comunicacao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ComunicacaoController {

    @Inject
    ComunicacaoService service;

    private String currentUser(@HeaderParam("X-Authenticated-Username") String username) {
        return username == null ? "admin" : username;
    }

    @GET
    public Uni<List<ComunicacaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ComunicacaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ComunicacaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ComunicacaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ComunicacaoResponse> update(@PathParam("id") Long id, @Valid ComunicacaoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/{id}/enviar")
    public Uni<ComunicacaoResponse> enviar(@PathParam("id") Long id, @HeaderParam("X-Authenticated-Username") String username) {
        return service.enviar(id, currentUser(username));
    }
}