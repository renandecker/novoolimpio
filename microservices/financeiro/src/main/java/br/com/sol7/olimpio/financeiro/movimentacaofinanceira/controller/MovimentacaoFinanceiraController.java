package br.com.sol7.olimpio.financeiro.movimentacaofinanceira.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.service.MovimentacaoFinanceiraService;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraRequest;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;

@Path("/api/financeiro/movimentacao-financeira")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MovimentacaoFinanceiraController {
    @Inject
    MovimentacaoFinanceiraService service;

    @GET
    public Uni<List<MovimentacaoFinanceiraResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<MovimentacaoFinanceiraResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<MovimentacaoFinanceiraResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @GET
    @Path("/caixa/{caixaId}")
    public Uni<List<MovimentacaoFinanceiraResponse>> buscarPorCaixa(@PathParam("caixaId") Long caixaId) {
        return service.buscarPorCaixa(caixaId);
    }

    @POST
    public Uni<Response> create(@Valid MovimentacaoFinanceiraRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    // Migrado de CaixaController.salvar (movimentacao extra: entrada/saida manual do caixa)
    @POST
    @Path("/movimentacao-extra")
    public Uni<Response> registrarMovimentacaoExtra(@Valid MovimentacaoFinanceiraRequest r) {
        return service.registrarMovimentacaoExtra(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<MovimentacaoFinanceiraResponse> update(@PathParam("id") Long id, @Valid MovimentacaoFinanceiraRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @DELETE
    @Path("/{id}/excluir-movimentacao")
    public Uni<Void> excluirMovimentacao(@PathParam("id") Long id) {
        return service.excluirMovimentacao(id);
    }
}
