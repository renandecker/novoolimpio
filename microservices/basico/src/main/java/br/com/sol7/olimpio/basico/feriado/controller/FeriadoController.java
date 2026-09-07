package br.com.sol7.olimpio.basico.feriado.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Date;

import br.com.sol7.olimpio.basico.feriado.dto.CalendarioEventoResponse;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoAjusteResponse;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoRequest;
import br.com.sol7.olimpio.basico.feriado.dto.FeriadoResponse;
import br.com.sol7.olimpio.basico.feriado.dto.OcorrenciaFeriadoResponse;
import br.com.sol7.olimpio.basico.feriado.dto.TrocaFeriadosRequest;
import br.com.sol7.olimpio.basico.feriado.service.FeriadoService;

@Path("/api/basico/feriado")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FeriadoController {
    @Inject
    FeriadoService service;

    @GET
    public Uni<List<FeriadoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FeriadoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FeriadoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FeriadoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FeriadoResponse> update(@PathParam("id") Long id, @Valid FeriadoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/atualizar-oferecimento")
    public Uni<String> atualizarOferecimento() {
        return service.atualizarOferecimento();
    }


    @POST
    @Path("/atualizar-oferecimento-nao-ajustado")
    public Uni<String> atualizarOferecimentoNaoAjustado() {
        return service.atualizarOferecimentoNaoAjustado();
    }


    @POST
    @Path("/atualizar-oferecimento-ajustados")
    public Uni<String> atualizarOferecimentoAjustados() {
        return service.atualizarOferecimentoAjustados();
    }


    @POST
    @Path("/trocar-feriados")
    public Uni<Void> trocarFeriados(TrocaFeriadosRequest r) {
        return service.trocarFeriados(r == null ? null : r.destinoId(), r == null ? null : r.origemIds());
    }


    @GET
    @Path("/buscar-feriado-api")
    public Uni<Void> buscarFeriadoApi() {
        return service.buscarFeriadoApi();
    }


    @POST
    @Path("/gerar-novas-datas")
    public Uni<Void> gerarNovasDatas() {
        return service.gerarNovasDatas();
    }


    @GET
    @Path("/buscar-feriado-unidade")
    public Uni<List<Long>> buscarFeriadoUnidade(@QueryParam("data") Date data, @QueryParam("unidadeId") Long unidadeId, @QueryParam("tipoCursoId") Long tipoCursoId) {
        return service.buscarFeriadoUnidade(data, unidadeId, tipoCursoId);
    }


    @GET
    @Path("/buscar-feriado-fixo")
    public Uni<List<Long>> buscarFeriadoFixo() {
        return service.buscarFeriadoFixo();
    }


    @GET
    @Path("/verificar-feriado-existente")
    public Uni<Boolean> verificarFeriadoExistente(@QueryParam("data") Date data) {
        return service.verificarFeriadoExistente(data);
    }


    @GET
    @Path("/buscar-feriado-da-unidade")
    public Uni<List<Long>> buscarFeriadoDaUnidade(@QueryParam("unidadeId") Long unidadeId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.buscarFeriadoDaUnidade(unidadeId, inicio, fim);
    }


    @GET
    @Path("/buscar-feriado-da-unidade-list")
    public Uni<List<Long>> buscarFeriadoDaUnidadeList(@QueryParam("unidade") List<Long> unidade, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.buscarFeriadoDaUnidadeList(unidade, inicio, fim);
    }


    @GET
    @Path("/buscar-feriado-da-unidadetipo-curso")
    public Uni<List<Long>> buscarFeriadoDaUnidadetipoCurso(@QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.buscarFeriadoDaUnidadetipoCurso(inicio, fim);
    }


    @GET
    @Path("/buscar-feriado-com-unidades")
    public Uni<Long> buscarFeriadoComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarFeriadoComUnidades(entityId);
    }


    @GET
    @Path("/buscar-feriados-com-unidade-data")
    public Uni<List<Long>> buscarFeriadosComUnidadeData(@QueryParam("unidadeId") Long unidadeId, @QueryParam("data") Date data) {
        return service.buscarFeriadosComUnidadeData(unidadeId, data);
    }


    @GET
    @Path("/buscar-feriado-com-tipo-curso")
    public Uni<Long> buscarFeriadoComTipoCurso(@QueryParam("entityId") Long entityId) {
        return service.buscarFeriadoComTipoCurso(entityId);
    }


    @POST
    @Path("/atualizar-oferecimento2")
    public Uni<Void> atualizarOferecimento2(@QueryParam("ocorrenciaComponenteCurriculars") List<Long> ocorrenciaComponenteCurriculars) {
        return service.atualizarOferecimento2(ocorrenciaComponenteCurriculars);
    }

    @GET
    @Path("/ajustes/paged")
    public Uni<PagedResponse<FeriadoAjusteResponse>> feriadoAjustesPaged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.feriadoAjustesPaged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/ajustes/{id}")
    public Uni<FeriadoAjusteResponse> feriadoAjusteFind(@PathParam("id") Long id) {
        return service.feriadoAjusteFind(id);
    }

    @GET
    @Path("/calendario/eventos")
    public Uni<List<CalendarioEventoResponse>> calendarioEventos() {
        return service.calendarioEventos();
    }

    @GET
    @Path("/ajustes/{id}/ocorrencias-ajustar")
    public Uni<List<OcorrenciaFeriadoResponse>> ocorrenciasAjustar(@PathParam("id") Long id) {
        return service.ocorrenciasAjustar(id);
    }

    @GET
    @Path("/ajustes/{id}/ocorrencias-nao-ajustar")
    public Uni<List<OcorrenciaFeriadoResponse>> ocorrenciasNaoAjustar(@PathParam("id") Long id) {
        return service.ocorrenciasNaoAjustar(id);
    }
}