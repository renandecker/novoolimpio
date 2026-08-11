package br.com.sol7.olimpio.financeiro.movimento;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/financeiro/movimento") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class MovimentoController { @Inject MovimentoService service; @GET public Uni<List<MovimentoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<MovimentoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<MovimentoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid MovimentoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<MovimentoResponse> update(@PathParam("id") Long id,@Valid MovimentoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete-cidade")
    public Uni<List<Long>> autoCompleteCidade(@QueryParam("query") String query) {
        return service.autoCompleteCidade(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-com-tipo")
    public Uni<List<Long>> autoCompleteComTipo(@QueryParam("query") String query, @QueryParam("tipoMovimentoId") Long tipoMovimentoId) {
        return service.autoCompleteComTipo(query, tipoMovimentoId);
    }

}