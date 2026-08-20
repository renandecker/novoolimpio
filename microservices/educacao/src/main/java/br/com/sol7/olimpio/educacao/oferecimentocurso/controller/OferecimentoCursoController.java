package br.com.sol7.olimpio.educacao.oferecimentocurso;

import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularResponse;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/oferecimento-curso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OferecimentoCursoController {

    @Inject
    OferecimentoCursoService service;

    @GET
    public Uni<List<OferecimentoCursoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<OferecimentoCursoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<OferecimentoCursoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid OferecimentoCursoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<OferecimentoCursoResponse> update(@PathParam("id") Long id, @Valid OferecimentoCursoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    // Grupo + turmas (detalhe do "Oferecimento Curso").
    @GET
    @Path("/detalhe")
    public Uni<OferecimentoCursoDetalheResponse> detalhe(@QueryParam("id") Long id) {
        return service.detalhe(id);
    }

    // Turmas (OferecimentoComponenteCurricular) de um grupo - migrado de GrupoRepository.listarOferecimentos.
    @GET
    @Path("/listar-oferecimentos")
    public Uni<List<OferecimentoComponenteCurricularResponse>> listarOferecimentos(@QueryParam("grupoId") Long grupoId) {
        return service.listarOferecimentos(grupoId);
    }

    // Gera (e persiste) as ocorrencias de todas as turmas do grupo - migrado de gerarAulaCursoSequencia.
    @POST
    @Path("/gerar-aula-curso-sequencia")
    public Uni<Integer> gerarAulaCursoSequencia(@Valid GerarAulaCursoSequenciaRequest r) {
        return service.gerarAulaCursoSequencia(r);
    }

    @GET
    @Path("/buscar-turno-educacao")
    public Uni<String> buscarTurnoEducacao(@QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.buscarTurnoEducacao(ocorrenciaComponenteCurricularId);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

    @GET
    @Path("/auto-complete-curriculo")
    public Uni<List<Long>> autoCompleteCurriculo(@QueryParam("query") String query) {
        return service.autoCompleteCurriculo(query);
    }

    @GET
    @Path("/buscar-informacoes-oferecimentos")
    public Uni<List<OferecimentoComponenteCurricularResponse>> buscarInformacoesOferecimentos(@QueryParam("grupoId") Long grupoId) {
        return service.listarOferecimentos(grupoId);
    }
}

