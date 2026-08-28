package br.com.sol7.olimpio.central.ligacao;

import br.com.sol7.olimpio.central.filaprioritaria.FilaPrioritariaService;
import br.com.sol7.olimpio.central.ordemligacao.OrdemLigacaoService;
import br.com.sol7.olimpio.central.resultadocontato.ResultadoContatoService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Path("/api/central/ligacao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LigacaoController {
    @Inject
    LigacaoService service;

    @Inject
    OrdemLigacaoService ordemLigacaoService;

    @Inject
    FilaPrioritariaService filaPrioritariaService;

    @Inject
    ResultadoContatoService resultadoContatoService;

    @GET
    public Uni<List<LigacaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<LigacaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<LigacaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid LigacaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<LigacaoResponse> update(@PathParam("id") Long id, @Valid LigacaoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

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

    // ===== NOVOS ENDPOINTS DE WORKFLOW =====

    @GET
    @Path("/dados-tela/{operacionalId}/{usuarioId}")
    public Uni<Map<String, Object>> carregarDadosTela(@PathParam("operacionalId") Long operacionalId, @PathParam("usuarioId") Long usuarioId) {
        return service.carregarDadosTela(operacionalId, usuarioId);
    }

    @GET
    @Path("/proxima-ligacao/{operacionalId}")
    public Uni<Map<String, Object>> buscarProximaLigacao(@PathParam("operacionalId") Long operacionalId) {
        return service.buscarProximaLigacao(operacionalId);
    }

    @GET
    @Path("/telefones-para-discar/{ordemLigacaoId}")
    public Uni<List<String>> buscarTelefonesParaDiscar(@PathParam("ordemLigacaoId") Long ordemLigacaoId) {
        return service.buscarTelefonesParaDiscar(ordemLigacaoId);
    }

    @GET
    @Path("/verificar-pronto/{usuarioId}")
    public Uni<Boolean> verificarProntoIniciarTrabalho(@PathParam("usuarioId") Long usuarioId) {
        return service.verificarProntoIniciarTrabalho(usuarioId);
    }

    @GET
    @Path("/meta-hoje/{operacionalId}")
    public Uni<Map<String, Object>> buscarMetaHoje(@PathParam("operacionalId") Long operacionalId) {
        return service.buscarMetaHoje(operacionalId);
    }

    @POST
    @Path("/finalizar")
    public Uni<LigacaoResponse> finalizarLigacao(LigacaoFinalizarRequest request) {
        return service.finalizarLigacao(request);
    }

    @POST
    @Path("/pausar")
    public Uni<LigacaoResponse> pausarLigacao(LigacaoPausaRequest request) {
        return service.pausarLigacao(request);
    }

    @POST
    @Path("/retornar-pausa")
    public Uni<LigacaoResponse> retornarPausa(LigacaoRetornoPausaRequest request) {
        return service.retornarPausa(request);
    }

    @POST
    @Path("/trocar-pacote")
    public Uni<Map<String, Object>> trocarPacote(LigacaoTrocarPacoteRequest request) {
        return service.trocarPacote(request);
    }

    @POST
    @Path("/agendar-compromisso")
    public Uni<LigacaoResponse> agendarCompromisso(LigacaoAgendarCompromissoRequest request) {
        return service.agendarCompromisso(request);
    }

    @POST
    @Path("/agendar-retorno")
    public Uni<FilaPrioritariaResponse> agendarRetorno(LigacaoAgendarRetornoRequest request) {
        return service.agendarRetorno(request);
    }

    @POST
    @Path("/desbloquear-tela")
    public Uni<Boolean> desbloquearTela(LigacaoDesbloquearRequest request) {
        return service.desbloquearTela(request);
    }

    @GET
    @Path("/historico/{prospectoId}")
    public Uni<List<LigacaoResponse>> buscarHistoricoCompleto(@PathParam("prospectoId") Long prospectoId) {
        return service.buscarHistoricoCompleto(prospectoId);
    }

    @GET
    @Path("/fila-prioritaria/{usuarioId}")
    public Uni<List<FilaPrioritariaResponse>> buscarFilaPrioritaria(@PathParam("usuarioId") Long usuarioId) {
        return filaPrioritariaService.buscarPorUsuario(usuarioId);
    }

    @GET
    @Path("/resultado-contato/{tipoTela}")
    public Uni<List<ResultadoContatoResponse>> listarResultadosPorTela(@PathParam("tipoTela") int tipoTela) {
        return resultadoContatoService.listarPorTela(tipoTela);
    }
}