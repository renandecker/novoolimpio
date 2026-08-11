package br.com.sol7.olimpio.central.resultadocontato;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/central/resultado-contato") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ResultadoContatoController { @Inject ResultadoContatoService service; @GET public Uni<List<ResultadoContatoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ResultadoContatoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ResultadoContatoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ResultadoContatoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ResultadoContatoResponse> update(@PathParam("id") Long id,@Valid ResultadoContatoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-resultados-ordenado")
    public Uni<List<Long>> buscarResultadosOrdenado() {
        return service.buscarResultadosOrdenado();
    }


    @GET
    @Path("/buscar-resultados-ordenado-ligacao")
    public Uni<List<Long>> buscarResultadosOrdenadoLigacao() {
        return service.buscarResultadosOrdenadoLigacao();
    }

}