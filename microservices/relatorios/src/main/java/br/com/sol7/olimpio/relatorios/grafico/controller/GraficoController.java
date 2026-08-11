package br.com.sol7.olimpio.relatorios.grafico;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/relatorios/grafico") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class GraficoController { @Inject GraficoService service; @GET public Uni<List<GraficoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<GraficoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<GraficoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid GraficoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<GraficoResponse> update(@PathParam("id") Long id,@Valid GraficoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete-dimensao")
    public Uni<List<Long>> autoCompleteDimensao(@QueryParam("query") String query) {
        return service.autoCompleteDimensao(query);
    }


    @GET
    @Path("/auto-complete-medida")
    public Uni<List<Long>> autoCompleteMedida(@QueryParam("query") String query) {
        return service.autoCompleteMedida(query);
    }


    @GET
    @Path("/buscar-unidades")
    public Uni<List<Long>> buscarUnidades(@QueryParam("id") Long id) {
        return service.buscarUnidades(id);
    }


    @GET
    @Path("/buscar-perfils")
    public Uni<List<Long>> buscarPerfils(@QueryParam("id") Long id) {
        return service.buscarPerfils(id);
    }


    @GET
    @Path("/buscar-usuarios")
    public Uni<List<Long>> buscarUsuarios(@QueryParam("id") Long id) {
        return service.buscarUsuarios(id);
    }


    @GET
    @Path("/buscar-grafico-pelo-fato")
    public Uni<List<Long>> buscarGraficoPeloFato(@QueryParam("fatoId") Long fatoId) {
        return service.buscarGraficoPeloFato(fatoId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query, @QueryParam("estruturaId") Long estruturaId) {
        return service.autoComplete(query, estruturaId);
    }

}