package br.com.sol7.olimpio.educacao.gerarcertificado;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/gerar-certificado") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class GerarCertificadoController { @Inject GerarCertificadoService service; @GET public Uni<List<GerarCertificadoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<GerarCertificadoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<GerarCertificadoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid GerarCertificadoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<GerarCertificadoResponse> update(@PathParam("id") Long id,@Valid GerarCertificadoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @POST
    @Path("/gerar-certificado")
    public Uni<String> gerarCertificado(@QueryParam("contratos") List<Long> contratos) {
        return service.gerarCertificado(contratos);
    }


    @POST
    @Path("/gerar-componentes")
    public Uni<List<String>> gerarComponentes(@QueryParam("contratoId") Long contratoId) {
        return service.gerarComponentes(contratoId);
    }

}