package br.com.sol7.olimpio.basico.perfil.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.perfil.dto.PerfilRequest;
import br.com.sol7.olimpio.basico.perfil.dto.PerfilResponse;
import br.com.sol7.olimpio.basico.perfil.service.PerfilService;

@Path("/api/basico/perfil")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PerfilController {
    @Inject
    PerfilService service;

    @GET
    public Uni<List<PerfilResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<PerfilResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<PerfilResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid PerfilRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<PerfilResponse> update(@PathParam("id") Long id, @Valid PerfilRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/carregar-usuarios")
    public Uni<Void> carregarUsuarios(@QueryParam("perfilId") Long perfilId) {
        return service.carregarUsuarios(perfilId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
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
    @Path("/buscar-perfil-com-modulos")
    public Uni<Long> buscarPerfilComModulos(@QueryParam("id") Integer id) {
        return service.buscarPerfilComModulos(id);
    }


    @GET
    @Path("/buscar-perfil-modulos-com-perfil")
    public Uni<List<Long>> buscarPerfilModulosComPerfil(@QueryParam("id") Integer id) {
        return service.buscarPerfilModulosComPerfil(id);
    }

}