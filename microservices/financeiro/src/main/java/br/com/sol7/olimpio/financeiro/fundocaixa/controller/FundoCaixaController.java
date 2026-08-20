package br.com.sol7.olimpio.financeiro.fundocaixa;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/fundo-caixa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FundoCaixaController {
    @Inject
    FundoCaixaService service;

    @GET
    public Uni<List<FundoCaixaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FundoCaixaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FundoCaixaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FundoCaixaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FundoCaixaResponse> update(@PathParam("id") Long id, @Valid FundoCaixaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/verificar-senha-responsavel")
    public Uni<Boolean> verificarSenhaResponsavel() {
        return service.verificarSenhaResponsavel();
    }


    @GET
    @Path("/buscar-movimentacoes")
    public Uni<List<MovimentacaoFinanceiraResponse>> buscarMovimentacoes(@QueryParam("caixaId") Long caixaId) {
        return service.buscarMovimentacoes(caixaId);
    }


    @POST
    @Path("/imprimir-segunda-via")
    public Uni<Void> imprimirSegundaVia() {
        return service.imprimirSegundaVia();
    }


    @GET
    @Path("/buscar-caixa")
    public Uni<FundoCaixaService.CaixaComConfiguracao> buscarCaixa(@QueryParam("movimentacaoFinanceiraId") Long movimentacaoFinanceiraId) {
        return service.buscarCaixaPorMovimentacao(movimentacaoFinanceiraId);
    }


    @GET
    @Path("/verificar-cota-impressao")
    public Uni<Boolean> verificarCotaImpressao(@QueryParam("movimentacaoFinanceiraId") Long movimentacaoFinanceiraId) {
        return service.verificarCotaImpressao(movimentacaoFinanceiraId);
    }


    @POST
    @Path("/imprimir-comprovante-pagamento")
    public Uni<Void> imprimirComprovantePagamento(@QueryParam("movimentacaoFinanceiraId") Long movimentacaoFinanceiraId,
                                                  @QueryParam("usuarioId") Long usuarioId) {
        return service.imprimirSegundaVia(movimentacaoFinanceiraId, usuarioId);
    }

}