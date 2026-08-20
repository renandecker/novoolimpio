package br.com.sol7.olimpio.professor.nota.controller;

import br.com.sol7.olimpio.professor.nota.service.NotaGrauService;
import br.com.sol7.olimpio.professor.nota.dto.NotaGrauRequest;
import br.com.sol7.olimpio.professor.nota.dto.NotaGrauResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/professor/nota-grau")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotaGrauController {
    @Inject
    NotaGrauService service;

    @GET
    public Uni<List<NotaGrauResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<NotaGrauResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<NotaGrauResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid NotaGrauRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<NotaGrauResponse> update(@PathParam("id") Long id, @Valid NotaGrauRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-por-grau-nota")
    public Uni<List<NotaGrauResponse>> buscarPorGrauNota(@QueryParam("grauNotaId") Long grauNotaId) {
        return service.buscarPorGrauNota(grauNotaId);
    }

}
