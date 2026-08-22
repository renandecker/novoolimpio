package br.com.sol7.olimpio.professor.gestao.controller;

import br.com.sol7.olimpio.professor.gestao.dto.*;
import br.com.sol7.olimpio.professor.gestao.service.GestaoProfessorService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/professor/gestao-professor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GestaoProfessorController {

    @Inject
    GestaoProfessorService service;

    @GET
    @Path("/turmas")
    public Uni<List<TurmaDto>> listarTurmas(@QueryParam("professorId") Long professorId) {
        return service.listarTurmas(professorId);
    }

    @GET
    @Path("/identidade")
    public Uni<IdentidadeDto> identidade(@QueryParam("username") String username) {
        return service.identidade(username);
    }

    @GET
    @Path("/turmas/{id}/caderno")
    public Uni<CadernoDto> buscarCaderno(@PathParam("id") Long id) {
        return service.buscarCaderno(id);
    }

    @GET
    @Path("/turmas/{id}/notas")
    public Uni<NotasDto> buscarNotas(@PathParam("id") Long id) {
        return service.buscarNotas(id);
    }

    @GET
    @Path("/turmas/{id}/registros")
    public Uni<List<RegistroDto>> buscarRegistros(@PathParam("id") Long id) {
        return service.buscarRegistros(id);
    }

    @GET
    @Path("/pendencias")
    public Uni<List<PendenciaDto>> listarPendencias(@QueryParam("pessoaId") Long pessoaId) {
        return service.listarPendencias(pessoaId);
    }

    @POST
    @Path("/turmas/{id}/caderno/salvar")
    public Uni<Response> salvarChamada(@PathParam("id") Long id, SalvarChamadaRequest request) {
        return service.salvarChamada(request).map(v -> Response.ok().build());
    }

    @POST
    @Path("/turmas/{id}/notas/salvar")
    public Uni<Response> salvarNotas(@PathParam("id") Long id, SalvarNotasRequest request) {
        return service.salvarNotas(request).map(v -> Response.ok().build());
    }

    @POST
    @Path("/turmas/{id}/registros/salvar")
    public Uni<Response> salvarRegistro(@PathParam("id") Long id, SalvarRegistroRequest request) {
        return service.salvarRegistro(request).map(v -> Response.ok().build());
    }
}
