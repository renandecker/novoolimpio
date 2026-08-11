package br.com.sol7.olimpio.financeiro.configuracaocaixa;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/financeiro/configuracao-caixa") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ConfiguracaoCaixaController { @Inject ConfiguracaoCaixaService service; @GET public Uni<List<ConfiguracaoCaixaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ConfiguracaoCaixaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ConfiguracaoCaixaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ConfiguracaoCaixaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ConfiguracaoCaixaResponse> update(@PathParam("id") Long id,@Valid ConfiguracaoCaixaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete-usuario")
    public Uni<List<Long>> autoCompleteUsuario(@QueryParam("query") String query) {
        return service.autoCompleteUsuario(query);
    }


    @GET
    @Path("/buscar-configuracao-com-unidade-usuario")
    public Uni<Long> buscarConfiguracaoComUnidadeUsuario(@QueryParam("usuarioId") Long usuarioId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarConfiguracaoComUnidadeUsuario(usuarioId, unidadeId);
    }


    @GET
    @Path("/buscar-configuracao-com-usuario")
    public Uni<List<Long>> buscarConfiguracaoComUsuario(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarConfiguracaoComUsuario(usuarioId);
    }


    @GET
    @Path("/buscar-configuracao-caixa-unico")
    public Uni<List<Long>> buscarConfiguracaoCaixaUnico(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarConfiguracaoCaixaUnico(usuarioId);
    }


    @GET
    @Path("/buscar-configuracao-com-unidade-usuario-id")
    public Uni<Long> buscarConfiguracaoComUnidadeUsuarioId(@QueryParam("usuarioId") Long usuarioId, @QueryParam("unidadeId") Long unidadeId, @QueryParam("configuracaoCaixaId") Long configuracaoCaixaId) {
        return service.buscarConfiguracaoComUnidadeUsuarioId(usuarioId, unidadeId, configuracaoCaixaId);
    }

}