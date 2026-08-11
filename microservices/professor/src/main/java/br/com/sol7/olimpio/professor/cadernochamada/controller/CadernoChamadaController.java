package br.com.sol7.olimpio.professor.cadernochamada.controller;
import br.com.sol7.olimpio.professor.cadernochamada.service.CadernoChamadaService;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoChamadaRequest;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoChamadaResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/professor/caderno-chamada") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class CadernoChamadaController { @Inject CadernoChamadaService service; @GET public Uni<List<CadernoChamadaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<CadernoChamadaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<CadernoChamadaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid CadernoChamadaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<CadernoChamadaResponse> update(@PathParam("id") Long id,@Valid CadernoChamadaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/carregar-historico-chamada")
    public Uni<Void> carregarHistoricoChamada() {
        return service.carregarHistoricoChamada();
    }


    @GET
    @Path("/carregar-pendencia-professor")
    public Uni<Void> carregarPendenciaProfessor() {
        return service.carregarPendenciaProfessor();
    }


    @GET
    @Path("/carregar-pendencia")
    public Uni<Void> carregarPendencia(@QueryParam("pessoaId") Long pessoaId) {
        return service.carregarPendencia(pessoaId);
    }


    @GET
    @Path("/verificar-pendencias")
    public Uni<Void> verificarPendencias() {
        return service.verificarPendencias();
    }


    @GET
    @Path("/buscar-ocorrencia")
    public Uni<Void> buscarOcorrencia() {
        return service.buscarOcorrencia();
    }


    @GET
    @Path("/verificar-presenca")
    public Uni<Long> verificarPresenca(@QueryParam("matriculaId") Long matriculaId, @QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.verificarPresenca(matriculaId, ocorrenciaComponenteCurricularId);
    }


    @GET
    @Path("/carregar-cronograma")
    public Uni<Void> carregarCronograma() {
        return service.carregarCronograma();
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-quantidade-notas")
    public Uni<List<Integer>> buscarQuantidadeNotas() {
        return service.buscarQuantidadeNotas();
    }


    @GET
    @Path("/verificar-acesso")
    public Uni<Boolean> verificarAcesso(@QueryParam("tipo") String tipo, @QueryParam("modulo") String modulo) {
        return service.verificarAcesso(tipo, modulo);
    }

}
