package br.com.sol7.olimpio.professor.professor.controller;
import br.com.sol7.olimpio.professor.professor.service.ProfessorService;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorRequest;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorResponse;
import br.com.sol7.olimpio.professor.professor.dto.ProfessorAutoCompleteResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
import java.util.Date;
@Path("/api/professor/professor") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ProfessorController { @Inject ProfessorService service; @GET public Uni<List<ProfessorResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ProfessorResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ProfessorResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ProfessorRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ProfessorResponse> update(@PathParam("id") Long id,@Valid ProfessorRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-detalhes")
    public Uni<Void> buscarDetalhes(@QueryParam("event") String event) {
        return service.buscarDetalhes(event);
    }


    @GET
    @Path("/auto-complete-professor")
    public Uni<List<ProfessorAutoCompleteResponse>> autoCompleteProfessor(@QueryParam("query") String query) {
        return service.autoCompleteProfessor(query);
    }


    @GET
    @Path("/carregar-professor")
    public Uni<Void> carregarProfessor(@QueryParam("professorId") Long professorId) {
        return service.carregarProfessor(professorId);
    }


    @GET
    @Path("/buscar-professor-com-unidades")
    public Uni<Long> buscarProfessorComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarProfessorComUnidades(entityId);
    }


    @GET
    @Path("/buscar-professor-com-componente-curricular")
    public Uni<Long> buscarProfessorComComponenteCurricular(@QueryParam("entityId") Long entityId) {
        return service.buscarProfessorComComponenteCurricular(entityId);
    }


    @GET
    @Path("/buscar-lista-professores-para-turma")
    public Uni<List<Long>> buscarListaProfessoresParaTurma(@QueryParam("componenteCurricularId") Long componenteCurricularId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarListaProfessoresParaTurma(componenteCurricularId, unidadeId);
    }


    @GET
    @Path("/buscar-disponibilidade-professor-turno")
    public Uni<List<Long>> buscarDisponibilidadeProfessorTurno(@QueryParam("data") Date data, @QueryParam("professorId") Long professorId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.buscarDisponibilidadeProfessorTurno(data, professorId, inicio, fim);
    }


    @GET
    @Path("/buscar-disponibilidade-professor-turno-com-oferecimento")
    public Uni<List<Long>> buscarDisponibilidadeProfessorTurnoComOferecimento(@QueryParam("data") Date data, @QueryParam("professorId") Long professorId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim, @QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarDisponibilidadeProfessorTurnoComOferecimento(data, professorId, inicio, fim, oferecimentoComponenteCurricularId);
    }


    @GET
    @Path("/buscar-disponibilidade-com-dia-semana")
    public Uni<Long> buscarDisponibilidadeComDiaSemana(@QueryParam("dpId") Long dpId) {
        return service.buscarDisponibilidadeComDiaSemana(dpId);
    }


    @GET
    @Path("/auto-complete-professor-com-coponente")
    public Uni<List<Long>> autoCompleteProfessorComCoponente(@QueryParam("query") String query, @QueryParam("componenteCurricularId") Long componenteCurricularId, @QueryParam("unidadeId") Long unidadeId) {
        return service.autoCompleteProfessorComCoponente(query, componenteCurricularId, unidadeId);
    }


    @GET
    @Path("/buscar-professor-por-unidades")
    public Uni<List<Long>> buscarProfessorPorUnidades(@QueryParam("unidade") List<Long> unidade) {
        return service.buscarProfessorPorUnidades(unidade);
    }

}
