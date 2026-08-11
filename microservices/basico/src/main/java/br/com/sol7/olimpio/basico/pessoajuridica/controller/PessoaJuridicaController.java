package br.com.sol7.olimpio.basico.pessoajuridica.controller;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import br.com.sol7.olimpio.basico.pessoajuridica.dto.PessoaJuridicaRequest;
import br.com.sol7.olimpio.basico.pessoajuridica.dto.PessoaJuridicaResponse;
import br.com.sol7.olimpio.basico.pessoajuridica.service.PessoaJuridicaService;
@Path("/api/basico/pessoa-juridica") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class PessoaJuridicaController { @Inject PessoaJuridicaService service; @GET public Uni<List<PessoaJuridicaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<PessoaJuridicaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<PessoaJuridicaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid PessoaJuridicaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<PessoaJuridicaResponse> update(@PathParam("id") Long id,@Valid PessoaJuridicaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/verificar-existencia")
    public Uni<Boolean> verificarExistencia(@QueryParam("id") Integer id, @QueryParam("nome") String nome, @QueryParam("cnpj") String cnpj, @QueryParam("email") String email) {
        return service.verificarExistencia(id, nome, cnpj, email);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-todos")
    public Uni<List<Long>> autoCompleteTodos(@QueryParam("query") String query) {
        return service.autoCompleteTodos(query);
    }


    @GET
    @Path("/buscar-pessoa-com-cnpj")
    public Uni<List<Long>> buscarPessoaComCnpj(@QueryParam("cnpj") String cnpj) {
        return service.buscarPessoaComCnpj(cnpj);
    }

}