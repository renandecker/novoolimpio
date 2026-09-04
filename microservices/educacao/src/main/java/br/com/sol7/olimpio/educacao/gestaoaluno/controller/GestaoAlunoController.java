package br.com.sol7.olimpio.educacao.gestaoaluno;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/gestao-aluno")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GestaoAlunoController {
    @Inject
    GestaoAlunoService service;

    @GET
    public Uni<List<GestaoAlunoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<GestaoAlunoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<GestaoAlunoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid GestaoAlunoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<GestaoAlunoResponse> update(@PathParam("id") Long id, @Valid GestaoAlunoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

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
    public Uni<Void> atualizarDataVencimento(@QueryParam("parcelaId") Long parcelaId, @QueryParam("novaData") String novaData) {
        java.util.Date date = null;
        if (novaData != null) {
            try {
                date = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(novaData);
            } catch (java.text.ParseException e) {
                throw new jakarta.ws.rs.BadRequestException("Formato de data inválido. Use yyyy-MM-dd");
            }
        }
        return service.atualizarDataVencimento(parcelaId, date);
    }


    @POST
    @Path("/atualizar-valor-vencimento")
    public Uni<Void> atualizarValorVencimento(@QueryParam("parcelaId") Long parcelaId, @QueryParam("novoValor") Double novoValor) {
        return service.atualizarValorVencimento(parcelaId, novoValor);
    }


    @POST
    @Path("/atualizar-desconto-parcela")
    public Uni<Void> atualizarDescontoParcela(@QueryParam("parcelaId") Long parcelaId, @QueryParam("novoDesconto") Double novoDesconto) {
        return service.atualizarDescontoParcela(parcelaId, novoDesconto);
    }


    @POST
    @Path("/atualizar-juros-parcela")
    public Uni<Void> atualizarJurosParcela(@QueryParam("parcelaId") Long parcelaId, @QueryParam("novosJuros") Double novosJuros) {
        return service.atualizarJurosParcela(parcelaId, novosJuros);
    }


    @POST
    @Path("/atualizar-multa-parcela")
    public Uni<Void> atualizarMultaParcela(@QueryParam("parcelaId") Long parcelaId, @QueryParam("novaMulta") Double novaMulta) {
        return service.atualizarMultaParcela(parcelaId, novaMulta);
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
    public Uni<String> gerarContrato(@QueryParam("ccId") Long ccId, @QueryParam("usuarioId") Long usuarioId) {
        return service.gerarContrato(ccId, usuarioId);
    }


    @POST
    @Path("/gerar-promissoria")
    public Uni<String> gerarPromissoria(@QueryParam("ccId") Long ccId, @QueryParam("usuarioId") Long usuarioId) {
        return service.gerarPromissoria(ccId, usuarioId);
    }


    @GET
    @Path("/buscar-parcelas")
    public Uni<List<Long>> buscarParcelas(@QueryParam("contratoId") Long contratoId) {
        return service.buscarParcelas(contratoId);
    }


    @GET
    @Path("/buscar-matriculas")
    public Uni<List<Long>> buscarMatriculas(@QueryParam("contratoId") Long contratoId) {
        return service.buscarMatriculas(contratoId);
    }


    @GET
    @Path("/buscar-dias-pagamento")
    public Uni<List<Integer>> buscarDiasPagamento(@QueryParam("unidadeId") Long unidadeId,
                                                  @QueryParam("dataPrimeiraParcela") String dataPrimeiraParcela,
                                                  @QueryParam("prazoReparcSegunda") Integer prazoReparcSegunda) {
        java.util.Date date = null;
        if (dataPrimeiraParcela != null) {
            try {
                date = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(dataPrimeiraParcela);
            } catch (java.text.ParseException e) {
                throw new jakarta.ws.rs.BadRequestException("Formato de data inválido. Use yyyy-MM-dd");
            }
        }
        return service.buscarDiasPagamento(unidadeId, date, prazoReparcSegunda);
    }


    @GET
    @Path("/carregar-historico-cobranca")
    public Uni<List<Long>> carregarHistoricoCobranca(@QueryParam("pessoaId") Long pessoaId) {
        return service.carregarHistoricoCobranca(pessoaId);
    }


    @GET
    @Path("/buscar-detalhe-notas")
    public Uni<List<Long>> buscarDetalheNotas(@QueryParam("matriculaId") Long matriculaId) {
        return service.buscarDetalheNotas(matriculaId);
    }


    @GET
    @Path("/buscar-detalhe-presencas-troca-turma")
    public Uni<List<Long>> buscarDetalhePresencasTrocaTurma(@QueryParam("trocaTurmaId") Long trocaTurmaId) {
        return service.buscarDetalhePresencasTrocaTurma(trocaTurmaId);
    }


    @GET
    @Path("/buscar-detalhe-presencas")
    public Uni<List<Long>> buscarDetalhePresencas(@QueryParam("matriculaId") Long matriculaId) {
        return service.buscarDetalhePresencas(matriculaId);
    }


    @GET
    @Path("/carregar-matriculas-matricula")
    public Uni<List<Long>> carregarMatriculasMatricula(@QueryParam("matriculaId") Long matriculaId) {
        return service.carregarMatriculasMatricula(matriculaId);
    }


    @GET
    @Path("/carregar-matriculas-pessoa")
    public Uni<List<Long>> carregarMatriculasPessoa(@QueryParam("pessoaId") Long pessoaId) {
        return service.carregarMatriculasPessoa(pessoaId);
    }


    @GET
    @Path("/carregar-matriculas-contrato")
    public Uni<List<Long>> carregarMatriculasContrato(@QueryParam("contratoId") Long contratoId) {
        return service.carregarMatriculasContrato(contratoId);
    }


    @GET
    @Path("/carregar-historico-nap")
    public Uni<List<Long>> carregarHistoricoNap(@QueryParam("pessoaId") Long pessoaId) {
        return service.carregarHistoricoNap(pessoaId);
    }


    @POST
    @Path("/ajustar-responsavel")
    public Uni<Void> ajustarResponsavel(@QueryParam("contratoId") Long contratoId, @QueryParam("responsavelId") Long responsavelId) {
        return service.ajustarResponsavel(contratoId, responsavelId);
    }


    @POST
    @Path("/ajustar-unidade-responsavel")
    public Uni<Void> ajustarUnidadeResponsavel(@QueryParam("contratoId") Long contratoId, @QueryParam("unidadeResponsavelId") Long unidadeResponsavelId) {
        return service.ajustarUnidadeResponsavel(contratoId, unidadeResponsavelId);
    }


    @GET
    @Path("/carregar-responsaveis")
    public Uni<List<Long>> carregarResponsaveis(@QueryParam("alunoId") Long alunoId) {
        return service.carregarResponsaveis(alunoId);
    }


    @GET
    @Path("/verificar-acesso")
    public Uni<Boolean> verificarAcesso(@QueryParam("tipo") String tipo, @QueryParam("modulo") String modulo) {
        return service.verificarAcesso(tipo, modulo);
    }

}
