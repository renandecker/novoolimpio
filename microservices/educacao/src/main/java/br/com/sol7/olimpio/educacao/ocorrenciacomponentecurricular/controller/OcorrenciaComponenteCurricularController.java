package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Date;

@Path("/api/educacao/ocorrencia-componente-curricular")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OcorrenciaComponenteCurricularController {
    @Inject
    OcorrenciaComponenteCurricularService service;

    @GET
    public Uni<List<OcorrenciaComponenteCurricularResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<OcorrenciaComponenteCurricularResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<OcorrenciaComponenteCurricularResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid OcorrenciaComponenteCurricularRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<OcorrenciaComponenteCurricularResponse> update(@PathParam("id") Long id, @Valid OcorrenciaComponenteCurricularRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-ocorrencia-por-professor")
    public Uni<List<Long>> buscarOcorrenciaPorProfessor(@QueryParam("professorId") Long professorId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.buscarOcorrenciaPorProfessor(professorId, inicio, fim);
    }


    @GET
    @Path("/buscar-ocorrencia-por-oferecimento-e-datas")
    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoEDatas(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.buscarOcorrenciaPorOferecimentoEDatas(oferecimentoComponenteCurricularId, inicio, fim);
    }


    @GET
    @Path("/buscar-ocorrencia-por-oferecimento-e-datas-coringa")
    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoEDatasCoringa(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim, @QueryParam("coringa") Boolean coringa) {
        return service.buscarOcorrenciaPorOferecimentoEDatasCoringa(oferecimentoComponenteCurricularId, inicio, fim, coringa);
    }


    @GET
    @Path("/buscar-ocorrencia-extras")
    public Uni<List<Long>> buscarOcorrenciaExtras(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarOcorrenciaExtras(oferecimentoComponenteCurricularId);
    }


    @GET
    @Path("/buscar-ocorrencia-normais")
    public Uni<List<Long>> buscarOcorrenciaNormais(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarOcorrenciaNormais(oferecimentoComponenteCurricularId);
    }


    @GET
    @Path("/buscar-ocorrencia-por-oferecimento")
    public Uni<List<Long>> buscarOcorrenciaPorOferecimento(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarOcorrenciaPorOferecimento(oferecimentoComponenteCurricularId);
    }


    @GET
    @Path("/buscar-todas-ocorrencia-por-oferecimento")
    public Uni<List<Long>> buscarTodasOcorrenciaPorOferecimento(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarTodasOcorrenciaPorOferecimento(oferecimentoComponenteCurricularId);
    }


    @GET
    @Path("/buscar-ocorrencia-por-data-unidade")
    public Uni<List<Long>> buscarOcorrenciaPorDataUnidade(@QueryParam("date") Date date, @QueryParam("unidades") List<Long> unidades) {
        return service.buscarOcorrenciaPorDataUnidade(date, unidades);
    }


    @GET
    @Path("/buscar-ocorrencia-por-data-unidade2")
    public Uni<List<Long>> buscarOcorrenciaPorDataUnidade2(@QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim, @QueryParam("unidades") List<Long> unidades) {
        return service.buscarOcorrenciaPorDataUnidade2(inicio, fim, unidades);
    }


    @GET
    @Path("/buscar-ocorrencia-por-oferecimento-com-grupo")
    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoComGrupo(@QueryParam("grupoId") Long grupoId) {
        return service.buscarOcorrenciaPorOferecimentoComGrupo(grupoId);
    }

}
