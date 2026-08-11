package br.com.sol7.olimpio.comercial.prospectolist;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/comercial/prospecto-list") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class ProspectoListController { @Inject ProspectoListService service; @GET public Uni<List<ProspectoListResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<ProspectoListResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<ProspectoListResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid ProspectoListRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<ProspectoListResponse> update(@PathParam("id") Long id,@Valid ProspectoListRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/carregar-quantidade-ligacao")
    public Uni<Void> carregarQuantidadeLigacao(@QueryParam("prospectoId") Long prospectoId) {
        return service.carregarQuantidadeLigacao(prospectoId);
    }


    @GET
    @Path("/carregar-historico-ligacao")
    public Uni<Void> carregarHistoricoLigacao(@QueryParam("prospectoId") Long prospectoId) {
        return service.carregarHistoricoLigacao(prospectoId);
    }


    @GET
    @Path("/carregar-prospectos-link")
    public Uni<Void> carregarProspectosLink() {
        return service.carregarProspectosLink();
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<Void> carregarProspectoParaVisualizacao(@QueryParam("entityId") Long entityId) {
        return service.carregarProspectoParaVisualizacao(entityId);
    }

}