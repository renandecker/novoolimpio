package br.com.sol7.olimpio.comercial.gerarpacote;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Map;

@Path("/api/comercial/gerar-pacote")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GerarPacoteController {
    @Inject
    GerarPacoteService service;

    @GET
    public Uni<List<GerarPacoteResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<GerarPacoteResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<GerarPacoteResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid GerarPacoteRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<GerarPacoteResponse> update(@PathParam("id") Long id, @Valid GerarPacoteRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/auto-complete-unidade")
    public Uni<List<Long>> autoCompleteUnidade() {
        return service.autoCompleteUnidade();
    }


    @GET
    @Path("/carregar-campos")
    public Uni<List<Map<String, Object>>> carregarCampos(@QueryParam("prospectoIds") List<Long> prospectoIds) {
        return service.carregarCampos(prospectoIds);
    }


    @GET
    @Path("/carregar-operacoes")
    public Uni<List<String>> carregarOperacoes(@QueryParam("tipoCampo") String tipoCampo) {
        return service.carregarOperacoes(tipoCampo);
    }


    @GET
    @Path("/auto-complete-componente")
    public Uni<List<Long>> autoCompleteComponente(@QueryParam("query") String query) {
        return service.autoCompleteComponente(query);
    }


    @GET
    @Path("/auto-complete-curriculo")
    public Uni<List<Long>> autoCompleteCurriculo(@QueryParam("query") String query) {
        return service.autoCompleteCurriculo(query);
    }


    @GET
    @Path("/carregar-operacoe")
    public Uni<List<String>> carregarOperacoe() {
        return service.carregarOperacoe();
    }


    @GET
    @Path("/carregar-operacoes-ligacao")
    public Uni<List<String>> carregarOperacoesLigacao() {
        return service.carregarOperacoesLigacao();
    }


    @GET
    @Path("/carregar-operacoes-academico")
    public Uni<List<String>> carregarOperacoesAcademico(@QueryParam("tipoFiltro") Integer tipoFiltro) {
        return service.carregarOperacoesAcademico(tipoFiltro);
    }


    @GET
    @Path("/carregar-prospecto-para-visualizacao")
    public Uni<List<Map<String, Object>>> carregarProspectoParaVisualizacao(@QueryParam("entityId") Long entityId) {
        return service.carregarProspectoParaVisualizacao(entityId);
    }

}