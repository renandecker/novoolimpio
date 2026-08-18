package br.com.sol7.olimpio.educacao.gestaoaluno;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.inject.Inject; import jakarta.validation.Valid; import jakarta.ws.rs.*; import jakarta.ws.rs.core.*; import java.util.List;
@Path("/api/educacao/gestao-aluno") @Produces(MediaType.APPLICATION_JSON) @Consumes(MediaType.APPLICATION_JSON) public class GestaoAlunoController { @Inject GestaoAlunoService service; @GET public Uni<List<GestaoAlunoResponse>> list(){return service.list();} @GET @Path("/paged") public Uni<PagedResponse<GestaoAlunoResponse>> paged(@QueryParam("page") Integer page,@QueryParam("size") Integer size){return service.paged(page==null?0:page,size==null?10:size);} @GET @Path("/{id}") public Uni<GestaoAlunoResponse> find(@PathParam("id") Long id){return service.find(id);}@POST public Uni<Response> create(@Valid GestaoAlunoRequest r){return service.create(r).map(item->Response.status(Response.Status.CREATED).entity(item).build());}@PUT @Path("/{id}") public Uni<GestaoAlunoResponse> update(@PathParam("id") Long id,@Valid GestaoAlunoRequest r){return service.update(id,r);}@DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id){return service.delete(id);} 

    @GET
    @Path("/carregar-pre-cancelamentos-contrato")
    public Uni<Void> carregarPreCancelamentosContrato(@QueryParam("contratoId") Long contratoId) {
        return service.carregarPreCancelamentosContrato(contratoId);
    }


    @GET
    @Path("/carregar-pre-cancelamentos-matricula")
    public Uni<Void> carregarPreCancelamentosMatricula(@QueryParam("matriculaId") Long matriculaId) {
        return service.carregarPreCancelamentosMatricula(matriculaId);
    }


    @GET
    @Path("/verificar-c-onfigura-parcela-global")
    public Uni<Void> verificarCOnfiguraParcelaGlobal() {
        return service.verificarCOnfiguraParcelaGlobal();
    }


    @POST
    @Path("/atualizar-data-vencimento")
    public Uni<Void> atualizarDataVencimento(@QueryParam("parcelaId") Long parcelaId) {
        return service.atualizarDataVencimento(parcelaId);
    }


    @POST
    @Path("/atualizar-valor-vencimento")
    public Uni<Void> atualizarValorVencimento(@QueryParam("parcelaId") Long parcelaId) {
        return service.atualizarValorVencimento(parcelaId);
    }


    @POST
    @Path("/atualizar-desconto-parcela")
    public Uni<Void> atualizarDescontoParcela(@QueryParam("parcelaId") Long parcelaId) {
        return service.atualizarDescontoParcela(parcelaId);
    }


    @POST
    @Path("/atualizar-juros-parcela")
    public Uni<Void> atualizarJurosParcela(@QueryParam("parcelaId") Long parcelaId) {
        return service.atualizarJurosParcela(parcelaId);
    }


    @POST
    @Path("/atualizar-multa-parcela")
    public Uni<Void> atualizarMultaParcela(@QueryParam("parcelaId") Long parcelaId) {
        return service.atualizarMultaParcela(parcelaId);
    }


    @POST
    @Path("/ajuste-manual-valor-reparcela")
    public Uni<Boolean> ajusteManualValorReparcela(@QueryParam("parcela") String parcela) {
        return service.ajusteManualValorReparcela(parcela);
    }


    @GET
    @Path("/auto-complete-aluno")
    public Uni<List<Long>> autoCompleteAluno(@QueryParam("query") String query) {
        return service.autoCompleteAluno(query);
    }


    @POST
    @Path("/gerar-contrato")
    public Uni<String> gerarContrato(@QueryParam("ccId") Long ccId) {
        return service.gerarContrato(ccId);
    }


    @POST
    @Path("/gerar-promissoria")
    public Uni<String> gerarPromissoria(@QueryParam("ccId") Long ccId) {
        return service.gerarPromissoria(ccId);
    }


    @GET
    @Path("/buscar-parcelas")
    public Uni<Void> buscarParcelas() {
        return service.buscarParcelas();
    }


    @GET
    @Path("/buscar-matriculas")
    public Uni<Void> buscarMatriculas(@QueryParam("event") String event) {
        return service.buscarMatriculas(event);
    }


    @GET
    @Path("/buscar-dias-pagamento")
    public Uni<Void> buscarDiasPagamento() {
        return service.buscarDiasPagamento();
    }


    @GET
    @Path("/carregar-historico-cobranca")
    public Uni<Void> carregarHistoricoCobranca() {
        return service.carregarHistoricoCobranca();
    }


    @GET
    @Path("/buscar-detalhe-notas")
    public Uni<Void> buscarDetalheNotas(@QueryParam("event") String event) {
        return service.buscarDetalheNotas(event);
    }


    @GET
    @Path("/buscar-detalhe-presencas-troca-turma")
    public Uni<Void> buscarDetalhePresencasTrocaTurma(@QueryParam("event") String event) {
        return service.buscarDetalhePresencasTrocaTurma(event);
    }


    @GET
    @Path("/buscar-detalhe-presencas")
    public Uni<Void> buscarDetalhePresencas(@QueryParam("event") String event) {
        return service.buscarDetalhePresencas(event);
    }


    @GET
    @Path("/carregar-matriculas-matricula")
    public Uni<Void> carregarMatriculasMatricula() {
        return service.carregarMatriculasMatricula();
    }


    @GET
    @Path("/carregar-matriculas-pessoa")
    public Uni<Void> carregarMatriculasPessoa() {
        return service.carregarMatriculasPessoa();
    }


    @GET
    @Path("/carregar-matriculas-contrato")
    public Uni<Void> carregarMatriculasContrato() {
        return service.carregarMatriculasContrato();
    }


    @GET
    @Path("/carregar-historico-nap")
    public Uni<Void> carregarHistoricoNap() {
        return service.carregarHistoricoNap();
    }


    @POST
    @Path("/ajustar-responsavel")
    public Uni<Void> ajustarResponsavel() {
        return service.ajustarResponsavel();
    }


    @POST
    @Path("/ajustar-unidade-responsavel")
    public Uni<Void> ajustarUnidadeResponsavel() {
        return service.ajustarUnidadeResponsavel();
    }


    @GET
    @Path("/carregar-responsaveis")
    public Uni<Void> carregarResponsaveis(@QueryParam("alunoId") Long alunoId) {
        return service.carregarResponsaveis(alunoId);
    }


    @GET
    @Path("/verificar-acesso")
    public Uni<Boolean> verificarAcesso(@QueryParam("tipo") String tipo, @QueryParam("modulo") String modulo) {
        return service.verificarAcesso(tipo, modulo);
    }

}
