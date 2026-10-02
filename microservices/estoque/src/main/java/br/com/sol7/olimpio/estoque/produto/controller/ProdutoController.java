package br.com.sol7.olimpio.estoque.produto;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/estoque/produto")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProdutoController {
    @Inject
    ProdutoService service;

    @GET
    public Uni<List<ProdutoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ProdutoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ProdutoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ProdutoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ProdutoResponse> update(@PathParam("id") Long id, @Valid ProdutoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-unidade")
    public Uni<List<Long>> autoCompleteUnidade(@QueryParam("query") String query) {
        return service.autoCompleteUnidade(query);
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<ProdutoCamposVisualizacaoResponse> carregarProspectoParaVisualizacao(@QueryParam("entityId") Long entityId) {
        return service.carregarProspectoParaVisualizacao(entityId);
    }


    @GET
    @Path("/carregar-dyna-form")
    @GET
    @Path("/carregar-dyna-form")
    public Uni<ProdutoCamposVisualizacaoResponse> carregarDynaForm(@QueryParam("entityId") Long entityId) {
        return service.carregarDynaForm(entityId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-produto")
    public Uni<Long> buscarProduto(@QueryParam("produtoestoque") Integer produtoestoque) {
        return service.buscarProduto(produtoestoque);
    }


    @GET
    @Path("/carregar-campos")
    public Uni<Long> carregarCampos(@QueryParam("livroId") Long livroId) {
        return service.carregarCampos(livroId);
    }


    @GET
    @Path("/carregar-unidade")
    public Uni<Long> carregarUnidade(@QueryParam("produtoId") Long produtoId) {
        return service.carregarUnidade(produtoId);
    }


    @GET
    @Path("/carregar-fornecedor")
    public Uni<Long> carregarFornecedor(@QueryParam("produtoId") Long produtoId) {
        return service.carregarFornecedor(produtoId);
    }

}