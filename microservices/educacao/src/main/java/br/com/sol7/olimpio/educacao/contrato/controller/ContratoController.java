package br.com.sol7.olimpio.educacao.contrato;

import br.com.sol7.olimpio.educacao.contrato.dto.ContratoAutoCompleteResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/contrato")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContratoController {
    @Inject
    ContratoService service;

    @GET
    public Uni<List<ContratoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ContratoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ContratoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ContratoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ContratoResponse> update(@PathParam("id") Long id, @Valid ContratoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-contrato")
    public Uni<List<Long>> autoCompleteContrato(@QueryParam("query") String query, @QueryParam("pessoaId") Long pessoaId) {
        return service.autoCompleteContrato(query, pessoaId);
    }


    @GET
    @Path("/verifica-requisito")
    public Uni<String> verificaRequisito(@QueryParam("wrapper") String wrapper, @QueryParam("requisitosMatriz") List<Long> requisitosMatriz) {
        return service.verificaRequisito(wrapper, requisitosMatriz);
    }


    @GET
    @Path("/buscar-contratos-pessoa")
    public Uni<List<Long>> buscarContratosPessoa(@QueryParam("pessoaId") Long pessoaId) {
        return service.buscarContratosPessoa(pessoaId);
    }


    @GET
    @Path("/buscar-responsaveis-pessoa")
    public Uni<List<Long>> buscarResponsaveisPessoa(@QueryParam("pessoaId") Long pessoaId) {
        return service.buscarResponsaveisPessoa(pessoaId);
    }


    @GET
    @Path("/auto-complete-contrato2")
    public Uni<List<Long>> autoCompleteContrato2(@QueryParam("query") String query, @QueryParam("pessoaId") Long pessoaId) {
        return service.autoCompleteContrato2(query, pessoaId);
    }


    @GET
    @Path("/buscar-contrato-pessoa")
    public Uni<List<Long>> buscarContratoPessoa(@QueryParam("pessoaId") Long pessoaId) {
        return service.buscarContratoPessoa(pessoaId);
    }


    @GET
    @Path("/auto-complete-aluno")
    public Uni<List<ContratoAutoCompleteResponse>> autoCompleteAluno(@QueryParam("query") String query) {
        return service.autoCompleteAluno(query);
    }


    @GET
    @Path("/auto-complete-aluno-pagamento-pendente-unidade")
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendenteUnidade(@QueryParam("query") String query, @QueryParam("unidadeId") Long unidadeId) {
        return service.autoCompleteAlunoPagamentoPendenteUnidade(query, unidadeId);
    }


    @GET
    @Path("/auto-complete-aluno-pagamento-pendente")
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendente(@QueryParam("query") String query, @QueryParam("unidadesIds") List<Long> unidadesIds) {
        return service.autoCompleteAlunoPagamentoPendente(query, unidadesIds);
    }

}
