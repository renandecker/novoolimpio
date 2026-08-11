package br.com.sol7.olimpio.comercial.metadinamica;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/comercial/meta-dinamica") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class MetaDinamicaController { @Inject MetaDinamicaService service; @GET public Uni<List<MetaDinamicaResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<MetaDinamicaResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<MetaDinamicaResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid MetaDinamicaRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<MetaDinamicaResponse> update(@PathParam("id") Long id,@Valid MetaDinamicaRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/buscar-movimentacoes")
    public Uni<Void> buscarMovimentacoes(@QueryParam("event") String event) {
        return service.buscarMovimentacoes(event);
    }


    @GET
    @Path("/carregar-detalhes-metas-dia")
    public Uni<List<Long>> carregarDetalhesMetasDia(@QueryParam("metaDinamicaId") Long metaDinamicaId) {
        return service.carregarDetalhesMetasDia(metaDinamicaId);
    }


    @GET
    @Path("/carregar-detalhes-metas")
    public Uni<List<Long>> carregarDetalhesMetas(@QueryParam("metaDinamicaId") Long metaDinamicaId) {
        return service.carregarDetalhesMetas(metaDinamicaId);
    }


    @GET
    @Path("/carregar-detalhes-meta-semana")
    public Uni<List<Long>> carregarDetalhesMetaSemana(@QueryParam("metaDinamicaId") Long metaDinamicaId) {
        return service.carregarDetalhesMetaSemana(metaDinamicaId);
    }


    @POST
    @Path("/atualizar-valor-semana")
    public Uni<Void> atualizarValorSemana(@QueryParam("metaDinamicaSemanaWapper") String metaDinamicaSemanaWapper, @QueryParam("metaDiaDinamicaWapper") String metaDiaDinamicaWapper) {
        return service.atualizarValorSemana(metaDinamicaSemanaWapper, metaDiaDinamicaWapper);
    }


    @POST
    @Path("/atualizar-valor-semana-inverso")
    public Uni<Void> atualizarValorSemanaInverso(@QueryParam("metaDinamicaSemanaWapper") String metaDinamicaSemanaWapper, @QueryParam("metaDiaDinamicaWapper") String metaDiaDinamicaWapper) {
        return service.atualizarValorSemanaInverso(metaDinamicaSemanaWapper, metaDiaDinamicaWapper);
    }


    @POST
    @Path("/atualizar-valor-dia")
    public Uni<Void> atualizarValorDia(@QueryParam("metaDinamicaSemanaWapper") String metaDinamicaSemanaWapper, @QueryParam("metaDiaDinamicaWapper") String metaDiaDinamicaWapper) {
        return service.atualizarValorDia(metaDinamicaSemanaWapper, metaDiaDinamicaWapper);
    }


    @POST
    @Path("/atualizar-valor-dia-inverso")
    public Uni<Void> atualizarValorDiaInverso(@QueryParam("metaDinamicaSemanaWapper") String metaDinamicaSemanaWapper, @QueryParam("metaDiaDinamicaWapper") String metaDiaDinamicaWapper) {
        return service.atualizarValorDiaInverso(metaDinamicaSemanaWapper, metaDiaDinamicaWapper);
    }


    @POST
    @Path("/atualizar-valor-outro-dia")
    public Uni<Void> atualizarValorOutroDia(@QueryParam("metaDinamicaSemanaWapper") String metaDinamicaSemanaWapper, @QueryParam("metaDiaDinamicaWapper") String metaDiaDinamicaWapper) {
        return service.atualizarValorOutroDia(metaDinamicaSemanaWapper, metaDiaDinamicaWapper);
    }


    @POST
    @Path("/atualizar-valor-outra-semana")
    public Uni<Void> atualizarValorOutraSemana(@QueryParam("metaDinamicaSemanaWapper") String metaDinamicaSemanaWapper, @QueryParam("metaDiaDinamicaWapper") String metaDiaDinamicaWapper) {
        return service.atualizarValorOutraSemana(metaDinamicaSemanaWapper, metaDiaDinamicaWapper);
    }


    @POST
    @Path("/atualizar-valores-das-semanas")
    public Uni<Void> atualizarValoresDasSemanas() {
        return service.atualizarValoresDasSemanas();
    }


    @GET
    @Path("/verificar-meta-ano-mes-unidade")
    public Uni<List<Long>> verificarMetaAnoMesUnidade(@QueryParam("mes") Integer mes, @QueryParam("ano") Integer ano, @QueryParam("indicadorId") Long indicadorId, @QueryParam("unidadeId") Long unidadeId) {
        return service.verificarMetaAnoMesUnidade(mes, ano, indicadorId, unidadeId);
    }


    @GET
    @Path("/verificar-meta-ano-unidade")
    public Uni<List<Long>> verificarMetaAnoUnidade(@QueryParam("ano") Integer ano, @QueryParam("indicadorId") Long indicadorId, @QueryParam("unidadeId") Long unidadeId) {
        return service.verificarMetaAnoUnidade(ano, indicadorId, unidadeId);
    }


    @GET
    @Path("/verificar-meta-unidade")
    public Uni<List<Long>> verificarMetaUnidade(@QueryParam("indicadorId") Long indicadorId, @QueryParam("unidadeId") Long unidadeId) {
        return service.verificarMetaUnidade(indicadorId, unidadeId);
    }

}