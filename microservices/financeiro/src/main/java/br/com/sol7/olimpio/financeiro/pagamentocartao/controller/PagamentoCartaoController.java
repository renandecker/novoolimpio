package br.com.sol7.olimpio.financeiro.pagamentocartao.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.financeiro.pagamentocartao.service.PagamentoCartaoService;
import br.com.sol7.olimpio.financeiro.pagamentocartao.dto.PagamentoCartaoRequest;
import br.com.sol7.olimpio.financeiro.pagamentocartao.dto.PagamentoCartaoResponse;

@Path("/api/financeiro/pagamento-cartao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PagamentoCartaoController {
    @Inject
    PagamentoCartaoService service;

    @GET
    public Uni<List<PagamentoCartaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<PagamentoCartaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<PagamentoCartaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid PagamentoCartaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<PagamentoCartaoResponse> update(@PathParam("id") Long id, @Valid PagamentoCartaoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
