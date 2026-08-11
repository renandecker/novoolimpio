package br.com.sol7.olimpio.educacao.grupo;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/grupo") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class GrupoController { @Inject GrupoService service; @GET public Uni<List<GrupoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<GrupoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<GrupoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid GrupoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<GrupoResponse> update(@PathParam("id") Long id,@Valid GrupoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-com-unidades")
    public Uni<List<Long>> autoCompleteComUnidades(@QueryParam("lowerCase") String lowerCase, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidades(lowerCase, unidades);
    }


    @GET
    @Path("/auto-complete-com-curriculo")
    public Uni<List<Long>> autoCompleteComCurriculo(@QueryParam("lowerCase") String lowerCase, @QueryParam("curriculoId") Long curriculoId) {
        return service.autoCompleteComCurriculo(lowerCase, curriculoId);
    }

}