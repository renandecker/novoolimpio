package br.com.sol7.olimpio.basico.comunicacao.controller;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoRequest;
import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoResponse;
import br.com.sol7.olimpio.basico.comunicacao.service.ComunicacaoService;
@Path("/api/basico/comunicacao") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ComunicacaoController { @Inject ComunicacaoService service; @GET public Uni<List<ComunicacaoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ComunicacaoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ComunicacaoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ComunicacaoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ComunicacaoResponse> update(@PathParam("id") Long id,@Valid ComunicacaoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-unidade")
    public Uni<List<Long>> buscarUnidade(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarUnidade(comunicacaoId);
    }


    @GET
    @Path("/buscar-perfil")
    public Uni<List<Long>> buscarPerfil(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarPerfil(comunicacaoId);
    }


    @GET
    @Path("/buscar-agenda")
    public Uni<List<Long>> buscarAgenda(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarAgenda(comunicacaoId);
    }


    @GET
    @Path("/buscar-pessoa")
    public Uni<List<Long>> buscarPessoa(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarPessoa(comunicacaoId);
    }


    @GET
    @Path("/buscar-usuario")
    public Uni<List<Long>> buscarUsuario(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarUsuario(comunicacaoId);
    }


    @GET
    @Path("/buscaroferecimento")
    public Uni<List<Long>> buscaroferecimento(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscaroferecimento(comunicacaoId);
    }


    @GET
    @Path("/buscar-componente")
    public Uni<List<Long>> buscarComponente(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarComponente(comunicacaoId);
    }


    @GET
    @Path("/buscar-curso")
    public Uni<List<Long>> buscarCurso(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarCurso(comunicacaoId);
    }


    @GET
    @Path("/buscar-grupo")
    public Uni<List<Long>> buscarGrupo(@QueryParam("comunicacaoId") Long comunicacaoId) {
        return service.buscarGrupo(comunicacaoId);
    }

}