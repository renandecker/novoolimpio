package br.com.sol7.olimpio.educacao.criterio;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/criterio") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class CriterioController { @Inject CriterioService service; @GET public Uni<List<CriterioResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<CriterioResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<CriterioResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid CriterioRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<CriterioResponse> update(@PathParam("id") Long id,@Valid CriterioRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete-curriculo")
    public Uni<List<Long>> autoCompleteCurriculo(@QueryParam("query") String query) {
        return service.autoCompleteCurriculo(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-criterio-com-dias-semana")
    public Uni<Long> buscarCriterioComDiasSemana(@QueryParam("curriculoId") Long curriculoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarCriterioComDiasSemana(curriculoId, unidadeId);
    }


    @GET
    @Path("/buscar-criterio-com-turno")
    public Uni<Long> buscarCriterioComTurno(@QueryParam("curriculoId") Long curriculoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarCriterioComTurno(curriculoId, unidadeId);
    }


    @GET
    @Path("/buscar-criterio")
    public Uni<List<Long>> buscarCriterio(@QueryParam("curriculoId") Long curriculoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarCriterio(curriculoId, unidadeId);
    }

}