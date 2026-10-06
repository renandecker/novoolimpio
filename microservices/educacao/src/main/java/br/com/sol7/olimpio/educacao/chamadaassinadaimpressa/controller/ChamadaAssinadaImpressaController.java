package br.com.sol7.olimpio.educacao.chamadaassinadaimpressa;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricularResponse;

@Path("/api/educacao/chamada-assinada-impressa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChamadaAssinadaImpressaController {
    @Inject
    ChamadaAssinadaImpressaService service;

    @GET
    public Uni<List<ChamadaAssinadaImpressaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ChamadaAssinadaImpressaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ChamadaAssinadaImpressaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ChamadaAssinadaImpressaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ChamadaAssinadaImpressaResponse> update(@PathParam("id") Long id, @Valid ChamadaAssinadaImpressaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-ocorrencias/{chamadaId}")
    public Uni<List<OcorrenciaComponenteCurricularResponse>> buscarOcorrencias(@PathParam("chamadaId") Long chamadaId) {
        return service.buscarOcorrencias(chamadaId);
    }





    @GET
    @Path("/auto-complete-oferecimento")
    public Uni<List<Long>> autoCompleteOferecimento(@QueryParam("query") String query) {
        return service.autoCompleteOferecimento(query);
    }


    @POST
    @Path("/gerar-chamada-assinada-retrato")
    public Uni<String> gerarChamadaAssinadaRetrato(@QueryParam("ccId") Long ccId, @QueryParam("usuarioId") Long usuarioId) {
        return service.gerarChamadaAssinadaRetrato(ccId, usuarioId);
    }


    @POST
    @Path("/gerar-chamada-assinada-paisagem")
    public Uni<String> gerarChamadaAssinadaPaisagem(@QueryParam("ccId") Long ccId, @QueryParam("usuarioId") Long usuarioId) {
        return service.gerarChamadaAssinadaPaisagem(ccId, usuarioId);
    }


    @GET
    @Path("/carregar-chamadas-pendentes")
    public Uni<Void> carregarChamadasPendentes() {
        return service.carregarChamadasPendentes();
    }


    @GET
    @Path("/carregar-chamadas-corringa")
    public Uni<Void> carregarChamadasCorringa(@QueryParam("oId") Long oId) {
        return service.carregarChamadasCorringa(oId);
    }


    @GET
    @Path("/carregar-chamadas-normais")
    public Uni<Void> carregarChamadasNormais(@QueryParam("oId") Long oId, @QueryParam("chamadas") Integer chamadas) {
        return service.carregarChamadasNormais(oId, chamadas);
    }


    @GET
    @Path("/carregar-chamadas")
    public Uni<Void> carregarChamadas(@QueryParam("oId") Long oId, @QueryParam("ocorrenciaComponenteCurriculars") List<Long> ocorrenciaComponenteCurriculars, @QueryParam("chamadas") Integer chamadas, @QueryParam("coringa") Boolean coringa) {
        return service.carregarChamadas(oId, ocorrenciaComponenteCurriculars, chamadas, coringa);
    }


    @POST
    @Path("/carregar-chamadas-pendentes-automatico")
    public Uni<Void> carregarChamadasPendentesAutomatico() {
        return service.carregarChamadasPendentesAutomatico();
    }

}
