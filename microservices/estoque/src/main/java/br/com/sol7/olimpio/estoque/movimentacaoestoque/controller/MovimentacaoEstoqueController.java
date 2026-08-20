package br.com.sol7.olimpio.estoque.movimentacaoestoque;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/estoque/movimentacao-estoque")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MovimentacaoEstoqueController {

    @Inject
    MovimentacaoEstoqueService service;

    @GET
    public Uni<List<MovimentacaoEstoqueResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<MovimentacaoEstoqueResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/unidade/{unidadeId}")
    public Uni<List<MovimentacaoEstoqueResponse>> listByUnidade(@PathParam("unidadeId") Long unidadeId) {
        return service.listByUnidade(unidadeId);
    }

    @GET
    @Path("/{id}")
    public Uni<MovimentacaoEstoqueResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid MovimentacaoEstoqueRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    // Migrado de EstoqueProdutoController.salvaEntrada: registra entrada e soma no ControleEstoque da unidade
    @POST
    @Path("/entrada")
    public Uni<Response> saveOrUpdate(@Valid MovimentacaoEstoqueRequest r) {
        return service.saveOrUpdate(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    // Entrada de produto do centro de distribuição para a unidade
    @POST
    @Path("/entrada-central")
    public Uni<Response> entradaCentral(@Valid MovimentacaoEstoqueRequest r) {
        return service.entradaCentral(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    // Saída de produto da unidade para o centro de distribuição
    @POST
    @Path("/saida-central")
    public Uni<Response> saidaCentral(@Valid MovimentacaoEstoqueRequest r) {
        return service.saidaCentral(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<MovimentacaoEstoqueResponse> update(@PathParam("id") Long id, @Valid MovimentacaoEstoqueRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
