package br.com.sol7.olimpio.estoque.solicitacaoestoque.controller;

import br.com.sol7.olimpio.estoque.solicitacaoestoque.SolicitacaoEstoqueRequest;
import br.com.sol7.olimpio.estoque.solicitacaoestoque.SolicitacaoEstoqueResponse;
import br.com.sol7.olimpio.estoque.solicitacaoestoque.SolicitacaoEstoqueService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.enums.Motivo;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.List;

@Path("/api/estoque/solicitacao-estoque")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SolicitacaoEstoqueController {

    @Inject
    SolicitacaoEstoqueService service;

    @GET
    public Uni<List<SolicitacaoEstoqueResponse>> list(@QueryParam("unidadeId") Long unidadeId) {
        return unidadeId != null ? service.listByUnidade(unidadeId) : service.list();
    }

    @GET @Path("/paged")
    public Uni<PagedResponse<SolicitacaoEstoqueResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @POST @Path("/solicitar")
    public Uni<Response> solicitarItem(@Valid SolicitacaoEstoqueRequest r) {
        return service.solicitarItem(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @GET @Path("/count/item")
    public Uni<Long> countPorItem(@QueryParam("unidadeId") Long unidadeId, @QueryParam("produtoId") Long produtoId, @QueryParam("motivo") Motivo motivo) {
        return service.countPorItem(unidadeId, produtoId, motivo);
    }

    @GET @Path("/count/unidade")
    public Uni<Long> countPorUnidade(@QueryParam("unidadeId") Long unidadeId, @QueryParam("motivo") Motivo motivo) {
        return service.countPorUnidade(unidadeId, motivo);
    }

    @GET @Path("/{id}")
    public Uni<SolicitacaoEstoqueResponse> find(@PathParam("id") Long id) { return service.find(id); }

    @POST
    public Uni<Response> create(@Valid SolicitacaoEstoqueRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT @Path("/{id}")
    public Uni<SolicitacaoEstoqueResponse> update(@PathParam("id") Long id, @Valid SolicitacaoEstoqueRequest r) { return service.update(id, r); }

    @DELETE @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) { return service.delete(id); }
}
