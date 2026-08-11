package br.com.sol7.olimpio.basico.pessoafisica.controller;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import br.com.sol7.olimpio.basico.pessoafisica.dto.PessoaFisicaRequest;
import br.com.sol7.olimpio.basico.pessoafisica.dto.PessoaFisicaResponse;
import br.com.sol7.olimpio.basico.pessoafisica.service.PessoaFisicaService;
@Path("/api/basico/pessoa-fisica") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class PessoaFisicaController { @Inject PessoaFisicaService service; @GET public Uni<List<PessoaFisicaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<PessoaFisicaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<PessoaFisicaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid PessoaFisicaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<PessoaFisicaResponse> update(@PathParam("id") Long id,@Valid PessoaFisicaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/verificar-existencia")
    public Uni<Boolean> verificarExistencia(@QueryParam("id") Integer id, @QueryParam("nome") String nome, @QueryParam("cpf") String cpf, @QueryParam("rg") String rg, @QueryParam("email") String email) {
        return service.verificarExistencia(id, nome, cpf, rg, email);
    }


    @GET
    @Path("/auto-complete-todos")
    public Uni<List<Long>> autoCompleteTodos(@QueryParam("query") String query) {
        return service.autoCompleteTodos(query);
    }


    @GET
    @Path("/auto-complete-contrato-todos")
    public Uni<List<Long>> autoCompleteContratoTodos(@QueryParam("query") String query) {
        return service.autoCompleteContratoTodos(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-testemunha")
    public Uni<List<Long>> autoCompleteTestemunha(@QueryParam("query") String query) {
        return service.autoCompleteTestemunha(query);
    }


    @GET
    @Path("/auto-complete-acao")
    public Uni<List<Long>> autoCompleteAcao(@QueryParam("query") String query) {
        return service.autoCompleteAcao(query);
    }


    @GET
    @Path("/buscar-pessoa-com-cpf")
    public Uni<List<Long>> buscarPessoaComCpf(@QueryParam("cpf") String cpf) {
        return service.buscarPessoaComCpf(cpf);
    }

}