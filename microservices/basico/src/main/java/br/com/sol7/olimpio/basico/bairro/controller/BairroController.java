package br.com.sol7.olimpio.basico.bairro.controller;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import br.com.sol7.olimpio.basico.bairro.dto.BairroRequest;
import br.com.sol7.olimpio.basico.bairro.dto.BairroResponse;
import br.com.sol7.olimpio.basico.bairro.service.BairroService;
@Path("/api/basico/bairro") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class BairroController { @Inject BairroService service; @GET public Uni<List<BairroResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<BairroResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<BairroResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid BairroRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<BairroResponse> update(@PathParam("id") Long id,@Valid BairroRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-logradouro-troca")
    public Uni<List<Long>> autoCompleteLogradouroTroca(@QueryParam("query") String query) {
        return service.autoCompleteLogradouroTroca(query);
    }


    @GET
    @Path("/auto-complete-com-cep")
    public Uni<List<Long>> autoCompleteComCep(@QueryParam("query") String query, @QueryParam("cep") String cep) {
        return service.autoCompleteComCep(query, cep);
    }


    @GET
    @Path("/auto-complete-com-cidade")
    public Uni<List<Long>> autoCompleteComCidade(@QueryParam("query") String query, @QueryParam("cidadeId") Long cidadeId) {
        return service.autoCompleteComCidade(query, cidadeId);
    }


    @GET
    @Path("/auto-complete-com-cidade-com-cep")
    public Uni<List<Long>> autoCompleteComCidadeComCep(@QueryParam("query") String query, @QueryParam("cidadeId") Long cidadeId, @QueryParam("cep") String cep) {
        return service.autoCompleteComCidadeComCep(query, cidadeId, cep);
    }


    @GET
    @Path("/auto-complete-com-cidade-estado")
    public Uni<List<Long>> autoCompleteComCidadeEstado(@QueryParam("query") String query, @QueryParam("cidadeId") Long cidadeId, @QueryParam("estadoId") Long estadoId) {
        return service.autoCompleteComCidadeEstado(query, cidadeId, estadoId);
    }


    @GET
    @Path("/auto-complete-com-cidade-estado-com-cep")
    public Uni<List<Long>> autoCompleteComCidadeEstadoComCep(@QueryParam("query") String query, @QueryParam("cidadeId") Long cidadeId, @QueryParam("estadoId") Long estadoId, @QueryParam("cep") String cep) {
        return service.autoCompleteComCidadeEstadoComCep(query, cidadeId, estadoId, cep);
    }

}