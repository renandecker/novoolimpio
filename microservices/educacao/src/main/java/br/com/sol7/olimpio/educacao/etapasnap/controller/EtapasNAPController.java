package br.com.sol7.olimpio.educacao.etapasnap;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/etapas-nap") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class EtapasNAPController { @Inject EtapasNAPService service; @GET public Uni<List<EtapasNAPResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<EtapasNAPResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<EtapasNAPResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid EtapasNAPRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<EtapasNAPResponse> update(@PathParam("id") Long id,@Valid EtapasNAPRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

}
