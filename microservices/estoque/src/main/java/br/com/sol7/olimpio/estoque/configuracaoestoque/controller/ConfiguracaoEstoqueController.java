package br.com.sol7.olimpio.estoque.configuracaoestoque;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/estoque/configuracao-estoque") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ConfiguracaoEstoqueController { @Inject ConfiguracaoEstoqueService service; @GET public Uni<List<ConfiguracaoEstoqueResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ConfiguracaoEstoqueResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ConfiguracaoEstoqueResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ConfiguracaoEstoqueRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ConfiguracaoEstoqueResponse> update(@PathParam("id") Long id,@Valid ConfiguracaoEstoqueRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete-usuario")
    public Uni<List<Long>> autoCompleteUsuario(@QueryParam("query") String query) {
        return service.autoCompleteUsuario(query);
    }


    @GET
    @Path("/buscar-configuracao-com-unidade-usuario")
    public Uni<Long> buscarConfiguracaoComUnidadeUsuario(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarConfiguracaoComUnidadeUsuario(unidadeId);
    }


    @GET
    @Path("/buscar-central")
    public Uni<Long> buscarCentral() {
        return service.buscarCentral();
    }

}