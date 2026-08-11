package br.com.sol7.olimpio.central.ligacao;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/central/ligacao") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class LigacaoController { @Inject LigacaoService service; @GET public Uni<List<LigacaoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<LigacaoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<LigacaoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid LigacaoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<LigacaoResponse> update(@PathParam("id") Long id,@Valid LigacaoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-meta")
    public Uni<Void> buscarMeta() {
        return service.buscarMeta();
    }


    @GET
    @Path("/carregar-pacotes")
    public Uni<Void> carregarPacotes() {
        return service.carregarPacotes();
    }


    @GET
    @Path("/verificar-senha-operador")
    public Uni<Boolean> verificarSenhaOperador(@QueryParam("senha") String senha) {
        return service.verificarSenhaOperador(senha);
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<Void> carregarProspectoParaVisualizacao() {
        return service.carregarProspectoParaVisualizacao();
    }


    @GET
    @Path("/buscar-ligacao-com-numero")
    public Uni<Void> buscarLigacaoComNumero() {
        return service.buscarLigacaoComNumero();
    }


    @GET
    @Path("/buscar-historico-ligacao")
    public Uni<List<Long>> buscarHistoricoLigacao(@QueryParam("prospecto") Integer prospecto) {
        return service.buscarHistoricoLigacao(prospecto);
    }


    @GET
    @Path("/buscar-historico-todas-ligacao-prospecto")
    public Uni<List<Long>> buscarHistoricoTodasLigacaoProspecto(@QueryParam("prospecto") Integer prospecto) {
        return service.buscarHistoricoTodasLigacaoProspecto(prospecto);
    }


    @GET
    @Path("/buscar-qtde-ligados-prospecto-com-resultado-operacional")
    public Uni<Long> buscarQtdeLigadosProspectoComResultadoOperacional(@QueryParam("prospectoId") Long prospectoId, @QueryParam("resultadoContatoId") Long resultadoContatoId, @QueryParam("operacionalId") Long operacionalId) {
        return service.buscarQtdeLigadosProspectoComResultadoOperacional(prospectoId, resultadoContatoId, operacionalId);
    }


    @GET
    @Path("/buscar-ligacao-com-numero2")
    public Uni<Long> buscarLigacaoComNumero2(@QueryParam("numero") String numero) {
        return service.buscarLigacaoComNumero2(numero);
    }

}