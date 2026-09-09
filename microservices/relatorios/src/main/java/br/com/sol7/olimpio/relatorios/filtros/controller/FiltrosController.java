package br.com.sol7.olimpio.relatorios.filtros.controller;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRelacoesRequest;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRelacoesResponse;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRequest;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosResponse;
import br.com.sol7.olimpio.relatorios.filtros.service.FiltrosService;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/filtros")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FiltrosController {
    @Inject
    FiltrosService service;

    @GET
    public Uni<List<FiltrosResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FiltrosResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FiltrosResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FiltrosRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FiltrosResponse> update(@PathParam("id") Long id, @Valid FiltrosRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/{id}/relacoes")
    public Uni<FiltrosRelacoesResponse> relacoes(@PathParam("id") Long id) {
        return service.relacoes(id);
    }

    @PUT
    @Path("/{id}/relacoes")
    public Uni<Void> replaceRelacoes(@PathParam("id") Long id, FiltrosRelacoesRequest r) {
        return service.replaceRelacoes(id, r);
    }

    @GET
    @Path("/auto-complete-dimensao")
    public Uni<List<Long>> autoCompleteDimensao(@QueryParam("query") String query) {
        return service.autoCompleteDimensao(query);
    }


    @GET
    @Path("/auto-complete-dimensao-relatorio")
    public Uni<List<Long>> autoCompleteDimensaoRelatorio(@QueryParam("query") String query) {
        return service.autoCompleteDimensaoRelatorio(query);
    }


    @GET
    @Path("/auto-complete-tabela")
    public Uni<List<Long>> autoCompleteTabela(@QueryParam("query") String query) {
        return service.autoCompleteTabela(query);
    }


    @GET
    @Path("/auto-complete-grafico")
    public Uni<List<Long>> autoCompleteGrafico(@QueryParam("query") String query) {
        return service.autoCompleteGrafico(query);
    }


    @GET
    @Path("/auto-complete-mapa")
    public Uni<List<Long>> autoCompleteMapa(@QueryParam("query") String query) {
        return service.autoCompleteMapa(query);
    }


    @GET
    @Path("/auto-complete-organograma")
    public Uni<List<Long>> autoCompleteOrganograma(@QueryParam("query") String query) {
        return service.autoCompleteOrganograma(query);
    }


    @GET
    @Path("/carregar-tipo")
    public Uni<Void> carregarTipo() {
        return service.carregarTipo();
    }


    @GET
    @Path("/carregar-operacao-query")
    public Uni<Void> carregarOperacaoQuery() {
        return service.carregarOperacaoQuery();
    }


    @GET
    @Path("/buscar-dados-tipo")
    public Uni<Void> buscarDadosTipo() {
        return service.buscarDadosTipo();
    }

}