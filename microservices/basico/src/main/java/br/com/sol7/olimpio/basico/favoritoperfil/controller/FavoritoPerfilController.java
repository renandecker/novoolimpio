package br.com.sol7.olimpio.basico.favoritoperfil.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.basico.favoritoperfil.dto.FavoritoPerfilRequest;
import br.com.sol7.olimpio.basico.favoritoperfil.dto.FavoritoPerfilResponse;
import br.com.sol7.olimpio.basico.favoritoperfil.service.FavoritoPerfilService;

@Path("/api/basico/favorito-perfil")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FavoritoPerfilController {
    @Inject
    FavoritoPerfilService service;

    @GET
    public Uni<List<FavoritoPerfilResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FavoritoPerfilResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FavoritoPerfilResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FavoritoPerfilRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FavoritoPerfilResponse> update(@PathParam("id") Long id, @Valid FavoritoPerfilRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-perfil-com-favoritos")
    public Uni<List<Long>> buscarPerfilComFavoritos(@QueryParam("perfilId") Long perfilId) {
        return service.buscarPerfilComFavoritos(perfilId);
    }


    @GET
    @Path("/buscar-perfils-com-favoritos")
    public Uni<List<Long>> buscarPerfilsComFavoritos(@QueryParam("perfil") List<Long> perfil) {
        return service.buscarPerfilsComFavoritos(perfil);
    }

}