package br.com.sol7.olimpio.professor.registroaula.controller;

import br.com.sol7.olimpio.professor.registroaula.service.RegistroAulaService;
import br.com.sol7.olimpio.professor.registroaula.dto.RegistroAulaRequest;
import br.com.sol7.olimpio.professor.registroaula.dto.RegistroAulaResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/professor/registro-aula")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RegistroAulaController {
    @Inject
    RegistroAulaService service;

    @GET
    public Uni<List<RegistroAulaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<RegistroAulaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<RegistroAulaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid RegistroAulaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<RegistroAulaResponse> update(@PathParam("id") Long id, @Valid RegistroAulaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-por-ocorrencia")
    public Uni<List<RegistroAulaResponse>> buscarPorOcorrencia(@QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.buscarPorOcorrencia(ocorrenciaComponenteCurricularId);
    }

}
