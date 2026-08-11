package br.com.sol7.olimpio.basico.pais.controller;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import br.com.sol7.olimpio.basico.pais.dto.PaisRequest;
import br.com.sol7.olimpio.basico.pais.dto.PaisResponse;
import br.com.sol7.olimpio.basico.pais.service.PaisService;
@Path("/api/basico/pais") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class PaisController { @Inject PaisService service; @GET public Uni<List<PaisResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<PaisResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<PaisResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid PaisRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<PaisResponse> update(@PathParam("id") Long id,@Valid PaisRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

}