package br.com.sol7.olimpio.relatorios.relatorio;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/relatorios/relatorio") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class RelatorioController { @Inject RelatorioService service; @GET public Uni<List<RelatorioResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<RelatorioResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<RelatorioResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid RelatorioRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<RelatorioResponse> update(@PathParam("id") Long id,@Valid RelatorioRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/carregar-relatorio")
    public Uni<Void> carregarRelatorio() {
        return service.carregarRelatorio();
    }

}