package br.com.sol7.olimpio.educacao.digitalizacao;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/digitalizacao") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class DigitalizacaoController { @Inject DigitalizacaoService service; @GET public Uni<List<DigitalizacaoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<DigitalizacaoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<DigitalizacaoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid DigitalizacaoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<DigitalizacaoResponse> update(@PathParam("id") Long id,@Valid DigitalizacaoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/carregar-dias-aula")
    public Uni<Void> carregarDiasAula() {
        return service.carregarDiasAula();
    }


    @GET
    @Path("/carregar-documentos-aluno")
    public Uni<Void> carregarDocumentosAluno() {
        return service.carregarDocumentosAluno();
    }


    @GET
    @Path("/carregar-matriculas")
    public Uni<Void> carregarMatriculas() {
        return service.carregarMatriculas();
    }


    @GET
    @Path("/carregar-ocorrencia")
    public Uni<Void> carregarOcorrencia(@QueryParam("digitalizacaoChamadaId") Long digitalizacaoChamadaId) {
        return service.carregarOcorrencia(digitalizacaoChamadaId);
    }


    @GET
    @Path("/verificar-presenca")
    public Uni<Long> verificarPresenca(@QueryParam("matriculaId") Long matriculaId, @QueryParam("ocorrenciaComponenteCurricularId") Long ocorrenciaComponenteCurricularId) {
        return service.verificarPresenca(matriculaId, ocorrenciaComponenteCurricularId);
    }

}
