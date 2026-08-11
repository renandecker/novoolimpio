package br.com.sol7.olimpio.comercial.campanha;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/comercial/campanha") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class CampanhaController { @Inject CampanhaService service; @GET public Uni<List<CampanhaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<CampanhaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<CampanhaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid CampanhaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<CampanhaResponse> update(@PathParam("id") Long id,@Valid CampanhaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-campanha-com-acoes")
    public Uni<Long> buscarCampanhaComAcoes(@QueryParam("id") Integer id) {
        return service.buscarCampanhaComAcoes(id);
    }


    @GET
    @Path("/buscar-campanha-da-unidade")
    public Uni<List<Long>> buscarCampanhaDaUnidade() {
        return service.buscarCampanhaDaUnidade();
    }


    @GET
    @Path("/buscar-campanha-com-unidades")
    public Uni<Long> buscarCampanhaComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarCampanhaComUnidades(entityId);
    }

}