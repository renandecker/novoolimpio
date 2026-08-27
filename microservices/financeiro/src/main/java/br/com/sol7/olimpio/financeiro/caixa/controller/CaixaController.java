package br.com.sol7.olimpio.financeiro.caixa;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.CalculoValorParcelaRequest;
import br.com.sol7.olimpio.financeiro.caixa.dto.CalculoValorParcelaResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.FechamentoCaixaTotaisResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.RegistrarPagamentoParcelaRequest;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.math.BigDecimal;

@Path("/api/financeiro/caixa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CaixaController {
    @Inject
    CaixaService service;

    @GET
    public Uni<List<CaixaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CaixaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CaixaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CaixaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @POST
    @Path("/abrir-novo-caixa")
    public Uni<Response> abrirNovoCaixa(@Valid CaixaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CaixaResponse> update(@PathParam("id") Long id, @Valid CaixaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-aluno-pagamento-pendente")
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendente(@QueryParam("query") String query) {
        return service.autoCompleteAlunoPagamentoPendente(query);
    }


    @GET
    @Path("/buscar-detalhe-caixa-parcelas")
    public Uni<Void> buscarDetalheCaixaParcelas(@QueryParam("event") String event) {
        return service.buscarDetalheCaixaParcelas(event);
    }


    @GET
    @Path("/auto-complete-movimento")
    public Uni<List<Long>> autoCompleteMovimento(@QueryParam("query") String query) {
        return service.autoCompleteMovimento(query);
    }


    @GET
    @Path("/verificar-senha-responsavel")
    public Uni<Boolean> verificarSenhaResponsavel() {
        return service.verificarSenhaResponsavel();
    }


    @GET
    @Path("/verificar-senha-operador")
    public Uni<Boolean> verificarSenhaOperador() {
        return service.verificarSenhaOperador();
    }


    @POST
    @Path("/imprimir-comprovante-pagamento")
    public Uni<Void> imprimirComprovantePagamento() {
        return service.imprimirComprovantePagamento();
    }


    @GET
    @Path("/buscar-numero-parcela")
    public Uni<Void> buscarNumeroParcela() {
        return service.buscarNumeroParcela();
    }


    @GET
    @Path("/buscar-parcela")
    public Uni<Void> buscarParcela() {
        return service.buscarParcela();
    }


    @GET
    @Path("/buscar-parcelas-aluno")
    public Uni<Void> buscarParcelasAluno() {
        return service.buscarParcelasAluno();
    }


    @GET
    @Path("/buscar-abertura-caixa")
    public Uni<List<Long>> buscarAberturaCaixa(@QueryParam("usuarioId") Long usuarioId) {
        return service.buscarAberturaCaixa(usuarioId);
    }


    @GET
    @Path("/buscar-abertura-caixa-com-usuario-unidade")
    public Uni<Long> buscarAberturaCaixaComUsuarioUnidade(@QueryParam("usuarioId") Long usuarioId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarAberturaCaixaComUsuarioUnidade(usuarioId, unidadeId);
    }

    @GET
    @Path("/fundo-caixa-sugerido")
    public Uni<BigDecimal> fundoCaixaSugerido(@QueryParam("usuarioId") Long usuarioId, @QueryParam("unidadeId") Long unidadeId) {
        return service.fundoCaixaSugerido(usuarioId, unidadeId);
    }

    @POST
    @Path("/fechamento-automatico")
    public Uni<List<CaixaService.FechamentoCaixaResumo>> fechamentoAutomatico() {
        return service.fechamentoAutomatico();
    }

    @GET
    @Path("/{id}/movimentacoes")
    public Uni<List<MovimentacaoFinanceiraResponse>> getMovimentacoes(@PathParam("id") Long id) {
        return service.buscarMovimentacaoCaixaEntrada(id);
    }

    @POST
    @Path("/{id}/abrir")
    public Uni<CaixaResponse> abrirCaixa(@PathParam("id") Long id) {
        return service.abrirCaixa(id);
    }

    @POST
    @Path("/calcular-valores-parcela")
    public Uni<CalculoValorParcelaResponse> calcularValoresParcela(@Valid CalculoValorParcelaRequest request) {
        return service.calcularValoresParcela(request);
    }

    @POST
    @Path("/registrar-pagamento-parcela")
    public Uni<Void> registrarPagamentoParcela(@Valid RegistrarPagamentoParcelaRequest request) {
        return service.registrarPagamentoParcela(request);
    }

    @POST
    @Path("/{id}/sangria")
    public Uni<SangriaResponse> registrarSangria(@PathParam("id") Long id, BigDecimal valor) {
        return service.registrarSangria(id, valor);
    }

    @GET
    @Path("/{id}/totais-fechamento")
    public Uni<FechamentoCaixaTotaisResponse> totaisFechamento(@PathParam("id") Long id) {
        return service.totaisFechamento(id);
    }

    @POST
    @Path("/{id}/fechar")
    public Uni<CaixaResponse> fecharCaixa(@PathParam("id") Long id) {
        return service.fecharCaixa(id);
    }

}