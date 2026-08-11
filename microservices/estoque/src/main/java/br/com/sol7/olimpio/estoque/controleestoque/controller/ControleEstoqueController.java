package br.com.sol7.olimpio.estoque.controleestoque;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/estoque/controle-estoque") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ControleEstoqueController { @Inject ControleEstoqueService service; @GET public Uni<List<ControleEstoqueResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ControleEstoqueResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ControleEstoqueResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ControleEstoqueRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ControleEstoqueResponse> update(@PathParam("id") Long id,@Valid ControleEstoqueRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/carregar-mapa")
    public Uni<Void> carregarMapa(@QueryParam("controleEntregaId") Long controleEntregaId) {
        return service.carregarMapa(controleEntregaId);
    }


    @GET
    @Path("/buscar-estoque")
    public Uni<Void> buscarEstoque() {
        return service.buscarEstoque();
    }


    @GET
    @Path("/auto-complete2")
    public Uni<List<Long>> autoComplete2(@QueryParam("query") String query, @QueryParam("unidadesId") Long unidadesId) {
        return service.autoComplete2(query, unidadesId);
    }


    @GET
    @Path("/auto-complete-com-unidade")
    public Uni<List<Long>> autoCompleteComUnidade(@QueryParam("unidadesId") Long unidadesId) {
        return service.autoCompleteComUnidade(unidadesId);
    }


    @GET
    @Path("/buscar-existencia-produto")
    public Uni<Long> buscarExistenciaProduto(@QueryParam("unidadeId") Long unidadeId, @QueryParam("produtoId") Long produtoId) {
        return service.buscarExistenciaProduto(unidadeId, produtoId);
    }


    @GET
    @Path("/buscar-produto-estoque")
    public Uni<Long> buscarProdutoEstoque(@QueryParam("produtoestoque") Integer produtoestoque) {
        return service.buscarProdutoEstoque(produtoestoque);
    }


    @GET
    @Path("/buscar-iten-unidade")
    public Uni<List<Long>> buscarItenUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarItenUnidade(unidadeId);
    }

}