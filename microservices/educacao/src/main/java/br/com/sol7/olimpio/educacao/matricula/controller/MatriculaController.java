package br.com.sol7.olimpio.educacao.matricula;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/matricula")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MatriculaController {
    @Inject
    MatriculaService service;

    @GET
    public Uni<List<MatriculaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<MatriculaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<MatriculaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid MatriculaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<MatriculaResponse> update(@PathParam("id") Long id, @Valid MatriculaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-completerematricula")
    public Uni<List<Long>> autoCompleterematricula(@QueryParam("query") String query) {
        return service.autoCompleterematricula(query);
    }


    @POST
    @Path("/gerar-carne-consultor")
    public Uni<String> gerarCarneConsultor() {
        return service.gerarCarneConsultor();
    }


    @GET
    @Path("/verifica-requisito")
    public Uni<String> verificaRequisito(@QueryParam("wrapper") String wrapper, @QueryParam("requisitosMatriz") List<Long> requisitosMatriz) {
        return service.verificaRequisito(wrapper, requisitosMatriz);
    }


    @GET
    @Path("/buscar-requisitos")
    public Uni<Void> buscarRequisitos(@QueryParam("curriculoId") Long curriculoId) {
        return service.buscarRequisitos(curriculoId);
    }


    @GET
    @Path("/buscar-dias-pagamento")
    public Uni<Void> buscarDiasPagamento() {
        return service.buscarDiasPagamento();
    }


    @GET
    @Path("/buscar-parcelas")
    public Uni<Void> buscarParcelas() {
        return service.buscarParcelas();
    }


    @GET
    @Path("/buscar-valor-curso")
    public Uni<Long> buscarValorCurso() {
        return service.buscarValorCurso();
    }


    @GET
    @Path("/verificar-parcela-editavel")
    public Uni<Boolean> verificarParcelaEditavel(@QueryParam("parcelaId") Long parcelaId) {
        return service.verificarParcelaEditavel(parcelaId);
    }


    @GET
    @Path("/buscar-matriculas-por-oferecimento")
    public Uni<List<Long>> buscarMatriculasPorOferecimento(@QueryParam("oferecimentoComponenteCurricularId") Long oferecimentoComponenteCurricularId) {
        return service.buscarMatriculasPorOferecimento(oferecimentoComponenteCurricularId);
    }


    @GET
    @Path("/buscar-valor-curso2")
    public Uni<Long> buscarValorCurso2(@QueryParam("curriculoId") Long curriculoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.buscarValorCurso2(curriculoId, unidadeId);
    }


    @GET
    @Path("/buscar-componentes-aprovados-por-alunos")
    public Uni<List<Long>> buscarComponentesAprovadosPorAlunos(@QueryParam("pessoaId") Long pessoaId) {
        return service.buscarComponentesAprovadosPorAlunos(pessoaId);
    }


    @GET
    @Path("/buscar-matriculas-por-contrato")
    public Uni<List<Long>> buscarMatriculasPorContrato(@QueryParam("contratoId") Long contratoId) {
        return service.buscarMatriculasPorContrato(contratoId);
    }


    @GET
    @Path("/buscar-matriculas-com-caderno-por-contrato")
    public Uni<List<Long>> buscarMatriculasComCadernoPorContrato(@QueryParam("contratoId") Long contratoId) {
        return service.buscarMatriculasComCadernoPorContrato(contratoId);
    }


    @GET
    @Path("/buscar-matriculas-ativas-nao-concluidas")
    public Uni<List<Long>> buscarMatriculasAtivasNaoConcluidas(@QueryParam("contratoId") Long contratoId) {
        return service.buscarMatriculasAtivasNaoConcluidas(contratoId);
    }


    @GET
    @Path("/buscar-matriculas-canceladas")
    public Uni<List<Long>> buscarMatriculasCanceladas(@QueryParam("contratoId") Long contratoId) {
        return service.buscarMatriculasCanceladas(contratoId);
    }

}
