package br.com.sol7.olimpio.educacao.valorcurso;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/valor-curso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ValorCursoController {
    @Inject
    ValorCursoService service;

    @GET
    public Uni<List<ValorCursoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ValorCursoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ValorCursoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ValorCursoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ValorCursoResponse> update(@PathParam("id") Long id, @Valid ValorCursoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-unidade")
    public Uni<List<Long>> autoCompleteUnidade(@QueryParam("query") String query) {
        return service.autoCompleteUnidade(query);
    }


    @GET
    @Path("/auto-complete-curriculo")
    public Uni<List<Long>> autoCompleteCurriculo(@QueryParam("query") String query) {
        return service.autoCompleteCurriculo(query);
    }


    @GET
    @Path("/buscar-valores-com-desconto")
    public Uni<Long> buscarValoresComDesconto(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComDesconto(valorCursoId);
    }


    @GET
    @Path("/buscarexistencia-valor-curso-contrato")
    public Uni<Boolean> buscarexistenciaValorCursoContrato(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarexistenciaValorCursoContrato(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-taxas")
    public Uni<Long> buscarValoresComTaxas(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComTaxas(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-formas-pagamento")
    public Uni<Long> buscarValoresComFormasPagamento(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComFormasPagamento(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-desconto-ativos")
    public Uni<Long> buscarValoresComDescontoAtivos(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComDescontoAtivos(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-taxas-ativos")
    public Uni<Long> buscarValoresComTaxasAtivos(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComTaxasAtivos(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-formas-pagamento-ativos")
    public Uni<Long> buscarValoresComFormasPagamentoAtivos(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComFormasPagamentoAtivos(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-retencao")
    public Uni<Long> buscarValoresComRetencao(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComRetencao(valorCursoId);
    }


    @GET
    @Path("/buscar-valores-com-unidades")
    public Uni<Long> buscarValoresComUnidades(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValoresComUnidades(valorCursoId);
    }


    @GET
    @Path("/buscar-valor-curso-contrato")
    public Uni<List<Long>> buscarValorCursoContrato(@QueryParam("valorCursoId") Long valorCursoId) {
        return service.buscarValorCursoContrato(valorCursoId);
    }

}
