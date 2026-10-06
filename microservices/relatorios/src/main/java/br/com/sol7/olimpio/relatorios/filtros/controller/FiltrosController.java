package br.com.sol7.olimpio.relatorios.filtros.controller;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltroRelatorioWrapperDTO;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRelacoesRequest;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRelacoesResponse;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosRequest;
import br.com.sol7.olimpio.relatorios.filtros.dto.FiltrosResponse;
import br.com.sol7.olimpio.relatorios.filtros.service.FiltrosService;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/relatorios/filtros")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FiltrosController {
    @Inject
    FiltrosService service;

    @GET
    public Uni<List<FiltrosResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FiltrosResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FiltrosResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid FiltrosRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FiltrosResponse> update(@PathParam("id") Long id, @Valid FiltrosRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/{id}/relacoes")
    public Uni<FiltrosRelacoesResponse> relacoes(@PathParam("id") Long id) {
        return service.relacoes(id);
    }

    @PUT
    @Path("/{id}/relacoes")
    public Uni<Void> replaceRelacoes(@PathParam("id") Long id, FiltrosRelacoesRequest r) {
        return service.replaceRelacoes(id, r);
    }

    @GET
    @Path("/auto-complete-dimensao")
    public Uni<List<Long>> autoCompleteDimensao(@QueryParam("query") String query) {
        return service.autoCompleteDimensao(query);
    }


    @GET
    @Path("/auto-complete-dimensao-relatorio")
    public Uni<List<Long>> autoCompleteDimensaoRelatorio(@QueryParam("query") String query) {
        return service.autoCompleteDimensaoRelatorio(query);
    }


    @GET
    @Path("/auto-complete-tabela")
    public Uni<List<Long>> autoCompleteTabela(@QueryParam("query") String query) {
        return service.autoCompleteTabela(query);
    }


    @GET
    @Path("/auto-complete-grafico")
    public Uni<List<Long>> autoCompleteGrafico(@QueryParam("query") String query) {
        return service.autoCompleteGrafico(query);
    }


    @GET
    @Path("/auto-complete-mapa")
    public Uni<List<Long>> autoCompleteMapa(@QueryParam("query") String query) {
        return service.autoCompleteMapa(query);
    }


    @GET
    @Path("/auto-complete-organograma")
    public Uni<List<Long>> autoCompleteOrganograma(@QueryParam("query") String query) {
        return service.autoCompleteOrganograma(query);
    }

    @GET
    @Path("/viewTabela")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewTabela(@QueryParam("tabelaId") Long tabelaId) {
        if (tabelaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewTabela(tabelaId)
                .onFailure().invoke(ex -> ex.printStackTrace());
    }

    @GET
    @Path("/listTabela")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForListTabela() {
        return service.getFiltersForListTabela();
    }

    @GET
    @Path("/viewMapa")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewMapa(@QueryParam("mapaId") Long mapaId) {
        if (mapaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewMapa(mapaId);
    }

    @GET
    @Path("/viewGrafico")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewGrafico(@QueryParam("graficoId") Long graficoId) {
        if (graficoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewGrafico(graficoId);
    }

    @GET
    @Path("/viewGraficoBarrasHorizontal")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewGraficoBarrasHorizontal(@QueryParam("graficoId") Long graficoId) {
        if (graficoId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewGrafico(graficoId);
    }

    @GET
    @Path("/listGrafico")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForListGrafico() {
        return service.getFiltersForListGrafico();
    }

    @GET
    @Path("/viewOrganograma")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewOrganograma(@QueryParam("organogramaId") Long organogramaId) {
        if (organogramaId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewOrganograma(organogramaId);
    }

    @GET
    @Path("/viewPainel")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewPainel(@QueryParam("painelId") Long painelId) {
        if (painelId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewPainel(painelId);
    }

    @GET
    @Path("/viewDashboard")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewDashboard(@QueryParam("painelId") Long painelId) {
        return getFiltersForViewPainel(painelId);
    }

    @GET
    @Path("/viewIndicadorGauge")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForViewIndicadorGauge(@QueryParam("indicadorGaugeId") Long indicadorGaugeId) {
        if (indicadorGaugeId == null) {
            return Uni.createFrom().item(List.of());
        }
        return service.getFiltersForViewIndicadorGauge(indicadorGaugeId);
    }

    @GET
    @Path("/listIndicadorGauge")
    public Uni<List<FiltroRelatorioWrapperDTO>> getFiltersForListIndicadorGauge() {
        return service.getFiltersForListIndicadorGauge();
    }

}
