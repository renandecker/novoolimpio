package br.com.sol7.olimpio.financeiro.formapagamento;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/financeiro/forma-pagamento") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class FormaPagamentoController { @Inject FormaPagamentoService service; @GET public Uni<List<FormaPagamentoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<FormaPagamentoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<FormaPagamentoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid FormaPagamentoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<FormaPagamentoResponse> update(@PathParam("id") Long id,@Valid FormaPagamentoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete2")
    public Uni<List<Long>> autoComplete2(@QueryParam("query") Integer query) {
        return service.autoComplete2(query);
    }


    @GET
    @Path("/verificar-cota-auto")
    public Uni<Void> verificarCotaAuto() {
        return service.verificarCotaAuto();
    }


    @GET
    @Path("/verificar-cota")
    public Uni<Void> verificarCota() {
        return service.verificarCota();
    }


    @GET
    @Path("/verificar-cota-entity")
    public Uni<Void> verificarCotaEntity(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.verificarCotaEntity(valorCursoId);
    }

}