package br.com.sol7.olimpio.estoque.estoqueproduto;

import br.com.sol7.olimpio.estoque.controleestoque.ControleEstoqueResponse;
import br.com.sol7.olimpio.estoque.pendenciavendaproduto.PendenciaVendaProdutoResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.math.BigDecimal;
import java.util.List;

@Path("/api/estoque/estoque-produto")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EstoqueProdutoController {

    @Inject
    EstoqueProdutoService service;
    @Inject
    br.com.sol7.olimpio.estoque.pendenciavendaproduto.PendenciaVendaProdutoService pendenciaVendaProdutoService;

    @GET
    @Path("/controle")
    public Uni<List<ControleEstoqueResponse>> listarControlePorUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.listarControlePorUnidade(unidadeId);
    }

    @GET
    @Path("/pendencias")
    public Uni<List<PendenciaVendaProdutoResponse>> pendencias(@QueryParam("unidadeId") Long unidadeId) {
        return pendenciaVendaProdutoService.listarPorUnidade(unidadeId);
    }

    @POST
    @Path("/entrada")
    public Uni<Response> salvaEntrada(@Valid EstoqueProdutoEntradaRequest r) {
        return service.salvaEntrada(r).replaceWith(() -> Response.status(Response.Status.CREATED).build());
    }

    @POST
    @Path("/solicitacao")
    public Uni<Response> salvaSolicitacao(@Valid EstoqueProdutoSolicitacaoRequest r) {
        return service.salvaSolicitacao(r).replaceWith(() -> Response.status(Response.Status.CREATED).build());
    }

    @PUT
    @Path("/pendencia/{id}/entregar")
    public Uni<Void> salvaPendenciaEntregue(@PathParam("id") Long id) {
        return service.salvaPendenciaEntregue(id);
    }

    @GET
    @Path("/verifica-entrega-pendencia")
    public Uni<Boolean> verificaEntregaPendencia(@QueryParam("dataEntrega") Long dataEntregaEpochMillis) {
        java.util.Date data = dataEntregaEpochMillis == null ? null : new java.util.Date(dataEntregaEpochMillis);
        return Uni.createFrom().item(service.verificaEntregaPendencia(data));
    }

    @GET
    @Path("/contadores")
    public Uni<ContadoresEstoqueResponse> contadores(@QueryParam("unidadeId") Long unidadeId, @QueryParam("produtoId") Long produtoId) {
        return service.contadores(unidadeId, produtoId);
    }

    @GET
    @Path("/calcular-valor")
    public Uni<ValorCalculadoResponse> calcularValor(@QueryParam("valor") BigDecimal valor, @QueryParam("quantidade") Integer quantidade) {
        return service.calcularValor(valor, quantidade == null ? 1 : quantidade);
    }
}
