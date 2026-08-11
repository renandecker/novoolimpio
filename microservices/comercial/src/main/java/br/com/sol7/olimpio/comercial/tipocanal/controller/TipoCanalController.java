package br.com.sol7.olimpio.comercial.tipocanal;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/comercial/tipo-canal") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class TipoCanalController { @Inject TipoCanalService service; @GET public Uni<List<TipoCanalResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<TipoCanalResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<TipoCanalResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid TipoCanalRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<TipoCanalResponse> update(@PathParam("id") Long id,@Valid TipoCanalRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-tipo-canal-telemarketing")
    public Uni<String> buscarTipoCanalTelemarketing() {
        return service.buscarTipoCanalTelemarketing();
    }


    @GET
    @Path("/buscar-tipo-canal-emailmarketing")
    public Uni<String> buscarTipoCanalEmailmarketing() {
        return service.buscarTipoCanalEmailmarketing();
    }


    @GET
    @Path("/buscar-tipo-canal-mala-direta")
    public Uni<String> buscarTipoCanalMalaDireta() {
        return service.buscarTipoCanalMalaDireta();
    }

}