package br.com.sol7.olimpio.estoque.produtofornecedor;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/estoque/produto-fornecedor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProdutoFornecedorController {

    @Inject
    ProdutoFornecedorService service;

    @GET
    @Path("/produto/{produtoId}")
    public Uni<List<Long>> listFornecedorIdsByProduto(@PathParam("produtoId") Long produtoId) {
        return service.listFornecedorIdsByProduto(produtoId);
    }

    @POST
    public Uni<Response> add(@QueryParam("produtoId") Long produtoId, @QueryParam("fornecedorId") Long fornecedorId) {
        return service.add(produtoId, fornecedorId).replaceWith(() -> Response.status(Response.Status.CREATED).build());
    }

    @DELETE
    public Uni<Void> remove(@QueryParam("produtoId") Long produtoId, @QueryParam("fornecedorId") Long fornecedorId) {
        return service.remove(produtoId, fornecedorId);
    }
}
