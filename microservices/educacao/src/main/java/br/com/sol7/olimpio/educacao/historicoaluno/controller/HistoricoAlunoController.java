package br.com.sol7.olimpio.educacao.historicoaluno;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/historico-aluno") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class HistoricoAlunoController { @Inject HistoricoAlunoService service; @GET public Uni<List<HistoricoAlunoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<HistoricoAlunoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<HistoricoAlunoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid HistoricoAlunoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<HistoricoAlunoResponse> update(@PathParam("id") Long id,@Valid HistoricoAlunoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/carregar-usuario-agenda")
    public Uni<Void> carregarUsuarioAgenda() {
        return service.carregarUsuarioAgenda();
    }


    @GET
    @Path("/buscar-historico-aluno-com-compromissos")
    public Uni<Long> buscarHistoricoAlunoComCompromissos(@QueryParam("historico") Long historico) {
        return service.buscarHistoricoAlunoComCompromissos(historico);
    }

}