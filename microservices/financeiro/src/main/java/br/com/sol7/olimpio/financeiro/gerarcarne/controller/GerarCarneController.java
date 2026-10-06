package br.com.sol7.olimpio.financeiro.gerarcarne;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/gerar-carne")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GerarCarneController {
    @Inject
    GerarCarneService service;

    @GET
    public Uni<List<GerarCarneResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<GerarCarneResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<GerarCarneResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid GerarCarneRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<GerarCarneResponse> update(@PathParam("id") Long id, @Valid GerarCarneRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }


    @POST
    @Path("/imprimir-selecionadas")
    public Uni<String> imprimirSelecionadas() {
        return service.imprimirSelecionadas();
    }


    @POST
    @Path("/imprimir-historico")
    public Uni<String> imprimirHistorico(@QueryParam("ccId") Long ccId) {
        return service.imprimirHistorico(ccId);
    }


    @POST
    @Path("/imprimir-diario-classe")
    public Uni<String> imprimirDiarioClasse(@QueryParam("ofccId") Long ofccId) {
        return service.imprimirDiarioClasse(ofccId);
    }


    @POST
    @Path("/imprimir-boletim-teste")
    public Uni<String> imprimirBoletimTeste(@QueryParam("ccId") Long ccId) {
        return service.imprimirBoletimTeste(ccId);
    }


    @POST
    @Path("/gerar-carne-material")
    public Uni<String> gerarCarneMaterial(@QueryParam("vendaProdutoId") Long vendaProdutoId) {
        return service.gerarCarneMaterial(vendaProdutoId);
    }


    @POST
    @Path("/gerar-carne")
    public Uni<String> gerarCarne(@QueryParam("ccId") Long ccId) {
        return service.gerarCarne(ccId);
    }


    @POST
    @Path("/gerar-documento-cancelamento-contrato")
    public Uni<String> gerarDocumentoCancelamentoContrato(@QueryParam("ccId") Long ccId) {
        return service.gerarDocumentoCancelamentoContrato(ccId);
    }


    @GET
    @Path("/verificar-pre-cancelamento")
    public Uni<Boolean> verificarPreCancelamento(@QueryParam("cancelamentoId") Long cancelamentoId) {
        return service.verificarPreCancelamento(cancelamentoId);
    }


    @POST
    @Path("/gerar-previsao-contratual")
    public Uni<String> gerarPrevisaoContratual(@QueryParam("ccId") Long ccId) {
        return service.gerarPrevisaoContratual(ccId);
    }


    @POST
    @Path("/gerar-previsao-matricula")
    public Uni<String> gerarPrevisaoMatricula(@QueryParam("mmId") Long mmId) {
        return service.gerarPrevisaoMatricula(mmId);
    }


    @POST
    @Path("/gerar-documento-cancelamento-matricula")
    public Uni<String> gerarDocumentoCancelamentoMatricula(@QueryParam("mmId") Long mmId) {
        return service.gerarDocumentoCancelamentoMatricula(mmId);
    }


    @POST
    @Path("/gerar-via-documento-cancelamento-contratual")
    public Uni<String> gerarViaDocumentoCancelamentoContratual(@QueryParam("ccId") Long ccId) {
        return service.gerarViaDocumentoCancelamentoContratual(ccId);
    }


    @POST
    @Path("/gerar-via-documento-cancelamento-matricula")
    public Uni<String> gerarViaDocumentoCancelamentoMatricula(@QueryParam("mmId") Long mmId) {
        return service.gerarViaDocumentoCancelamentoMatricula(mmId);
    }

}
