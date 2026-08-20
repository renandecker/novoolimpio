package br.com.sol7.olimpio.professor.aula.controller;

import br.com.sol7.olimpio.professor.aula.dto.AulaDtos.AvaliacaoPerguntaAnexoRequest;
import br.com.sol7.olimpio.professor.aula.dto.AulaDtos.AvaliacaoPerguntaAnexoResponse;
import br.com.sol7.olimpio.professor.aula.service.AvaliacaoPerguntaAnexoService;
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

@Path("/api/professor/avaliacao-pergunta-anexo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AvaliacaoPerguntaAnexoController {

    @Inject
    AvaliacaoPerguntaAnexoService service;

    @GET
    public Uni<List<AvaliacaoPerguntaAnexoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<AvaliacaoPerguntaAnexoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<AvaliacaoPerguntaAnexoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid AvaliacaoPerguntaAnexoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<AvaliacaoPerguntaAnexoResponse> update(@PathParam("id") Long id, @Valid AvaliacaoPerguntaAnexoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
