package br.com.sol7.olimpio.basico.pessoa.controller;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import br.com.sol7.olimpio.basico.pessoa.dto.PessoaRequest;
import br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse;
import br.com.sol7.olimpio.basico.pessoa.service.PessoaService;
@Path("/api/basico/pessoa") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class PessoaController { @Inject PessoaService service; @GET public Uni<List<PessoaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<PessoaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<PessoaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid PessoaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<PessoaResponse> update(@PathParam("id") Long id,@Valid PessoaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @POST
    @Path("/gerar-login")
    public Uni<String> gerarLogin() {
        return service.gerarLogin();
    }


    @GET
    @Path("/buscar-pessoa-com-unidades")
    public Uni<Long> buscarPessoaComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarPessoaComUnidades(entityId);
    }


    @GET
    @Path("/buscar-pessoa-por-unidades")
    public Uni<List<Long>> buscarPessoaPorUnidades(@QueryParam("unidade") List<Long> unidade) {
        return service.buscarPessoaPorUnidades(unidade);
    }

}