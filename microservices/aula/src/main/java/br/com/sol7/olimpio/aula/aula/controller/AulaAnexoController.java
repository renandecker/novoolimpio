package br.com.sol7.olimpio.aula.aula.controller;

import br.com.sol7.olimpio.aula.aula.service.AulaAnexoService;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaAnexoRequest;
import br.com.sol7.olimpio.aula.dto.AulaDtos.AulaAnexoResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
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

@Path("/api/aula/aula-anexo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AulaAnexoController {

    @Inject
    AulaAnexoService service;

    @GET
    public Uni<List<AulaAnexoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<AulaAnexoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/por-aula")
    public Uni<List<AulaAnexoResponse>> anexosDaAula(@QueryParam("aulaId") Long aulaId) {
        return service.anexosDaAula(aulaId);
    }

    @GET
    @Path("/{id}")
    public Uni<AulaAnexoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid AulaAnexoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<AulaAnexoResponse> update(@PathParam("id") Long id, @Valid AulaAnexoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
