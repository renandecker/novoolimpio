package br.com.sol7.olimpio.professor.cadernochamada.controller;
import br.com.sol7.olimpio.professor.cadernochamada.service.HistoricoCadernoChamadaService;
import br.com.sol7.olimpio.professor.cadernochamada.dto.HistoricoCadernoChamadaRequest;
import br.com.sol7.olimpio.professor.cadernochamada.dto.HistoricoCadernoChamadaResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/professor/historico-caderno-chamada") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class HistoricoCadernoChamadaController { @Inject HistoricoCadernoChamadaService service; @GET public Uni<List<HistoricoCadernoChamadaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<HistoricoCadernoChamadaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<HistoricoCadernoChamadaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid HistoricoCadernoChamadaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<HistoricoCadernoChamadaResponse> update(@PathParam("id") Long id,@Valid HistoricoCadernoChamadaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-por-ocorrencia")
    public Uni<List<HistoricoCadernoChamadaResponse>> buscarPorOcorrencia(@QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.buscarPorOcorrencia(ocorrenciaComponenteCurricularId);
    }

}
