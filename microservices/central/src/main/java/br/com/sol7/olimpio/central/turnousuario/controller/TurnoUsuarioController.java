package br.com.sol7.olimpio.central.turnousuario;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/central/turno-usuario") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class TurnoUsuarioController { @Inject TurnoUsuarioService service; @GET public Uni<List<TurnoUsuarioResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<TurnoUsuarioResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{usuarioId}/{turnoTrabalhoId}") public Uni<TurnoUsuarioResponse> find(@PathParam("usuarioId") Long usuarioId,@PathParam("turnoTrabalhoId") Long turnoTrabalhoId){return service.find(usuarioId,turnoTrabalhoId);}@POST public Uni<Response> create(@Valid TurnoUsuarioRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{usuarioId}/{turnoTrabalhoId}") public Uni<TurnoUsuarioResponse> update(@PathParam("usuarioId") Long usuarioId,@PathParam("turnoTrabalhoId") Long turnoTrabalhoId,@Valid TurnoUsuarioRequest r){return service.update(usuarioId,turnoTrabalhoId,r);}@DELETE @Path("/{usuarioId}/{turnoTrabalhoId}") public Uni<Void> delete(@PathParam("usuarioId") Long usuarioId,@PathParam("turnoTrabalhoId") Long turnoTrabalhoId){return service.delete(usuarioId,turnoTrabalhoId);} 

    @POST
    @Path("/atualizar-lista-de-turnos")
    public Uni<Void> atualizarListaDeTurnos() {
        return service.atualizarListaDeTurnos();
    }


    @GET
    @Path("/buscar-turno")
    public Uni<List<Long>> buscarTurno(@QueryParam("operadorId") Long operadorId) {
        return service.buscarTurno(operadorId);
    }


    @GET
    @Path("/buscar-turno-dia-semana")
    public Uni<List<Long>> buscarTurnoDiaSemana(@QueryParam("operadorId") Long operadorId, @QueryParam("diaSemana") Integer diaSemana) {
        return service.buscarTurnoDiaSemana(operadorId, diaSemana);
    }


    @GET
    @Path("/verificar-turno-dia-semana")
    public Uni<Boolean> verificarTurnoDiaSemana(@QueryParam("operadorId") Long operadorId, @QueryParam("diaSemana") Integer diaSemana) {
        return service.verificarTurnoDiaSemana(operadorId, diaSemana);
    }


    @GET
    @Path("/buscar-turno-usuario")
    public Uni<List<Long>> buscarTurnoUsuario(@QueryParam("operadorId") Long operadorId) {
        return service.buscarTurnoUsuario(operadorId);
    }

}