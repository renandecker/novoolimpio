package br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Date;

@Path("/api/educacao/oferecimento-componente-curricular")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OferecimentoComponenteCurricularController {
    @Inject
    OferecimentoComponenteCurricularService service;

    @GET
    public Uni<List<OferecimentoComponenteCurricularResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<OferecimentoComponenteCurricularResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<OferecimentoComponenteCurricularResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid OferecimentoComponenteCurricularRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<OferecimentoComponenteCurricularResponse> update(@PathParam("id") Long id, @Valid OferecimentoComponenteCurricularRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-curriculo")
    public Uni<List<Long>> autoCompleteCurriculo(@QueryParam("query") String query) {
        return service.autoCompleteCurriculo(query);
    }


    @GET
    @Path("/verificar-caderno-oferecimento")
    public Uni<Void> verificarCadernoOferecimento() {
        return service.verificarCadernoOferecimento();
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/autocomplete-grupo")
    public Uni<List<Long>> autocompleteGrupo(@QueryParam("query") String query) {
        return service.autocompleteGrupo(query);
    }


    @GET
    @Path("/buscar-informacoes-oferecimentos")
    public Uni<Void> buscarInformacoesOferecimentos(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarInformacoesOferecimentos(oferecimentoComponenteCurricularId);
    }


    @POST
    @Path("/gerar-aula")
    public Uni<Void> gerarAula() {
        return service.gerarAula();
    }


    @GET
    @Path("/buscar-turno-educacao")
    public Uni<String> buscarTurnoEducacao(@QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.buscarTurnoEducacao(ocorrenciaComponenteCurricularId);
    }


    @GET
    @Path("/buscar-matriz-curricular")
    public Uni<List<Long>> buscarMatrizCurricular(@QueryParam("curriculoId") Long curriculoId) {
        return service.buscarMatrizCurricular(curriculoId);
    }


    @GET
    @Path("/autocomplete-com-curriculo-grupo-com-query")
    public Uni<List<Long>> autocompleteComCurriculoGrupoComQuery(@QueryParam("query") String query, @QueryParam("grupoId") Long grupoId, @QueryParam("curriculoId") Long curriculoId) {
        return service.autocompleteComCurriculoGrupoComQuery(query, grupoId, curriculoId);
    }


    @GET
    @Path("/autocomplete-com-curriculo-grupo-sem-query")
    public Uni<List<Long>> autocompleteComCurriculoGrupoSemQuery(@QueryParam("grupoId") Long grupoId, @QueryParam("curriculoId") Long curriculoId) {
        return service.autocompleteComCurriculoGrupoSemQuery(grupoId, curriculoId);
    }


    @GET
    @Path("/autocomplete-com-curriculo-com-query")
    public Uni<List<Long>> autocompleteComCurriculoComQuery(@QueryParam("query") String query, @QueryParam("grupoId") Long grupoId, @QueryParam("curriculoId") Long curriculoId) {
        return service.autocompleteComCurriculoComQuery(query, grupoId, curriculoId);
    }


    @GET
    @Path("/autocomplete-com-curriculo-sem-query")
    public Uni<List<Long>> autocompleteComCurriculoSemQuery(@QueryParam("grupoId") Long grupoId, @QueryParam("curriculoId") Long curriculoId) {
        return service.autocompleteComCurriculoSemQuery(grupoId, curriculoId);
    }


    @GET
    @Path("/buscar-ocorrencia-com-o-ferecimento")
    public Uni<Long> buscarOcorrenciaComOFerecimento(@QueryParam("entityId") Long entityId) {
        return service.buscarOcorrenciaComOFerecimento(entityId);
    }


    @GET
    @Path("/buscar-todos-ocorrencia-com-o-ferecimento")
    public Uni<Long> buscarTodosOcorrenciaComOFerecimento(@QueryParam("entityId") Long entityId) {
        return service.buscarTodosOcorrenciaComOFerecimento(entityId);
    }


    @GET
    @Path("/buscar-oferecimento-abertas-com-sala")
    public Uni<List<Long>> buscarOferecimentoAbertasComSala(@QueryParam("salaId") Long salaId) {
        return service.buscarOferecimentoAbertasComSala(salaId);
    }


    @GET
    @Path("/buscar-oferecimento-com-ocorrencia")
    public Uni<Long> buscarOferecimentoComOcorrencia(@QueryParam("entityId") Long entityId) {
        return service.buscarOferecimentoComOcorrencia(entityId);
    }


    @GET
    @Path("/buscar-oferecimento-com-ocorrencia-todos")
    public Uni<Long> buscarOferecimentoComOcorrenciaTodos(@QueryParam("entityId") Long entityId) {
        return service.buscarOferecimentoComOcorrenciaTodos(entityId);
    }


    @GET
    @Path("/verificar-existe-conflito")
    public Uni<List<Long>> verificarExisteConflito(@QueryParam("data") Date data, @QueryParam("salaId") Long salaId, @QueryParam("unidadeId") Long unidadeId) {
        return service.verificarExisteConflito(data, salaId, unidadeId);
    }


    @GET
    @Path("/verificar-existe-conflito-com-oferecimento")
    public Uni<List<Long>> verificarExisteConflitoComOferecimento(@QueryParam("data") Date data, @QueryParam("salaId") Long salaId, @QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId, @QueryParam("unidadeId") Long unidadeId) {
        return service.verificarExisteConflitoComOferecimento(data, salaId, oferecimentoComponenteCurricularId, unidadeId);
    }


    @GET
    @Path("/verificar-existe-conflito-com-oferecimentos")
    public Uni<List<Long>> verificarExisteConflitoComOferecimentos(@QueryParam("data") Date data, @QueryParam("salaId") Long salaId, @QueryParam("oferecimentoComponenteCurricular") List<Long> oferecimentoComponenteCurricular, @QueryParam("unidadeId") Long unidadeId) {
        return service.verificarExisteConflitoComOferecimentos(data, salaId, oferecimentoComponenteCurricular, unidadeId);
    }


    @GET
    @Path("/buscar-componentess-do-oferecimentos")
    public Uni<List<Long>> buscarComponentessDoOferecimentos(@QueryParam("componenteCurricularId") Long componenteCurricularId) {
        return service.buscarComponentessDoOferecimentos(componenteCurricularId);
    }


    @GET
    @Path("/verificar-existe-conflito-prorrogando-disciplina")
    public Uni<List<Long>> verificarExisteConflitoProrrogandoDisciplina(@QueryParam("data") Date data, @QueryParam("salaId") Long salaId, @QueryParam("oId") Long oId) {
        return service.verificarExisteConflitoProrrogandoDisciplina(data, salaId, oId);
    }


    @GET
    @Path("/verificar-disciplina")
    public Uni<Void> verificarDisciplina() {
        return service.verificarDisciplina();
    }


    @GET
    @Path("/buscar-oferecimento-com-dias-aula")
    public Uni<Long> buscarOferecimentoComDiasAula(@QueryParam("entityId") Long entityId) {
        return service.buscarOferecimentoComDiasAula(entityId);
    }


    @GET
    @Path("/verificarchamada-assinada")
    public Uni<Void> verificarchamadaAssinada() {
        return service.verificarchamadaAssinada();
    }


    @POST
    @Path("/ajustesreplica")
    public Uni<Void> ajustesreplica() {
        return service.ajustesreplica();
    }


    @GET
    @Path("/auto-complete-com-unidade")
    public Uni<List<Long>> autoCompleteComUnidade(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidade(query, unidades);
    }


    @GET
    @Path("/auto-complete-com-unidade-chamada-assinada")
    public Uni<List<Long>> autoCompleteComUnidadeChamadaAssinada(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidadeChamadaAssinada(query, unidades);
    }


    @POST
    @Path("/gerar-aula2")
    public Uni<Void> gerarAula2(@QueryParam("novoOferecimentoComponenteCurricularId") Long novoOferecimentoComponenteCurricularId, @QueryParam("dataInicio") Date dataInicio, @QueryParam("diasAulaSelecionado") List<Long> diasAulaSelecionado) {
        return service.gerarAula(novoOferecimentoComponenteCurricularId, dataInicio, diasAulaSelecionado).replaceWithVoid();
    }


    @GET
    @Path("/buscar-criterios")
    public Uni<Long> buscarCriterios(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarCriterios(oferecimentoComponenteCurricularId);
    }


    @POST
    @Path("/replicar-oferecimento-automatico")
    public Uni<Void> replicarOferecimentoAutomatico() {
        return service.replicarOferecimentoAutomatico().replaceWithVoid();
    }


    @POST
    @Path("/{id}/replicar")
    public Uni<Integer> replicarOferecimento(@PathParam("id") Long id) {
        return service.replicarOferecimento(id);
    }

}
