package br.com.sol7.olimpio.professor.cadernochamada.controller;
import br.com.sol7.olimpio.professor.cadernochamada.service.CadernoComponenteCurricularService;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoComponenteCurricularRequest;
import br.com.sol7.olimpio.professor.cadernochamada.dto.CadernoComponenteCurricularResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/professor/caderno-componente-curricular") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class CadernoComponenteCurricularController { @Inject CadernoComponenteCurricularService service; @GET public Uni<List<CadernoComponenteCurricularResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<CadernoComponenteCurricularResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<CadernoComponenteCurricularResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid CadernoComponenteCurricularRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<CadernoComponenteCurricularResponse> update(@PathParam("id") Long id,@Valid CadernoComponenteCurricularRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-por-ocorrencia")
    public Uni<List<CadernoComponenteCurricularResponse>> buscarPorOcorrencia(@QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.buscarPorOcorrencia(ocorrenciaComponenteCurricularId);
    }


    @GET
    @Path("/buscar-presenca")
    public Uni<CadernoComponenteCurricularResponse> buscarPresenca(@QueryParam("matriculaId") Long matriculaId, @QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.buscarPresenca(matriculaId, ocorrenciaComponenteCurricularId);
    }

}
