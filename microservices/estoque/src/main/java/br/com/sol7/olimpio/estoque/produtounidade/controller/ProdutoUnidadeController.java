package br.com.sol7.olimpio.estoque.produtounidade;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.List;

@Path("/api/estoque/produto-unidade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProdutoUnidadeController {

    @Inject ProdutoUnidadeService service;

    @GET
    @Path("/produto/{produtoId}")
    public Uni<List<Long>> listUnidadeIdsByProduto(@PathParam("produtoId") Long produtoId) {
        return service.listUnidadeIdsByProduto(produtoId);
    }

    @POST
    public Uni<Response> add(@QueryParam("produtoId") Long produtoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.add(produtoId, unidadeId).replaceWith(() -> Response.status(Response.Status.CREATED).build());
    }

    @DELETE
    public Uni<Void> remove(@QueryParam("produtoId") Long produtoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.remove(produtoId, unidadeId);
    }
}
