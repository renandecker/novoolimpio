package br.com.sol7.olimpio.educacao.curriculo;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/curriculo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CurriculoController {
    @Inject
    CurriculoService service;

    @GET
    public Uni<List<CurriculoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CurriculoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CurriculoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CurriculoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CurriculoResponse> update(@PathParam("id") Long id, @Valid CurriculoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-unidade-com-grupo")
    public Uni<List<Long>> autoCompleteUnidadeComGrupo(@QueryParam("query") String query) {
        return service.autoCompleteUnidadeComGrupo(query);
    }


    @GET
    @Path("/auto-complete-grupo")
    public Uni<List<Long>> autoCompleteGrupo(@QueryParam("query") String query) {
        return service.autoCompleteGrupo(query);
    }


    @GET
    @Path("/autocomplete-grupo-unidade")
    public Uni<List<Long>> autocompleteGrupoUnidade(@QueryParam("query") String query) {
        return service.autocompleteGrupoUnidade(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }

    @GET
    @Path("/auto-complete-full")
    public Uni<List<CurriculoResponse>> autoCompleteFull(@QueryParam("query") String query) {
        return service.autoCompleteFull(query);
    }


    @GET
    @Path("/buscar-produto")
    public Uni<Void> buscarProduto() {
        return service.buscarProduto();
    }


    @GET
    @Path("/auto-complete-produto")
    public Uni<List<Long>> autoCompleteProduto(@QueryParam("query") String query) {
        return service.autoCompleteProduto(query);
    }


    @GET
    @Path("/auto-complete-sub-categoria")
    public Uni<List<Long>> autoCompleteSubCategoria(@QueryParam("query") String query) {
        return service.autoCompleteSubCategoria(query);
    }


    @GET
    @Path("/buscar-curso-com-unidades")
    public Uni<Long> buscarCursoComUnidades(@QueryParam("entityId") Long entityId) {
        return service.buscarCursoComUnidades(entityId);
    }


    @GET
    @Path("/buscar-curso-com-matriz-curriculares")
    public Uni<Long> buscarCursoComMatrizCurriculares(@QueryParam("entityId") Long entityId) {
        return service.buscarCursoComMatrizCurriculares(entityId);
    }


    @GET
    @Path("/auto-complete-com-unidades")
    public Uni<List<Long>> autoCompleteComUnidades(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidades(query, unidades);
    }


    @GET
    @Path("/auto-complete-com-unidadesrematricula")
    public Uni<List<Long>> autoCompleteComUnidadesrematricula(@QueryParam("query") String query, @QueryParam("unidades") List<Long> unidades, @QueryParam("pessoaId") Long pessoaId) {
        return service.autoCompleteComUnidadesrematricula(query, unidades, pessoaId);
    }


    @GET
    @Path("/auto-complete-com-unidade")
    public Uni<List<Long>> autoCompleteComUnidade(@QueryParam("query") String query, @QueryParam("unidadeId") Long unidadeId) {
        return service.autoCompleteComUnidade(query, unidadeId);
    }


    @GET
    @Path("/auto-complete-com-unidades2")
    public Uni<List<Long>> autoCompleteComUnidades2(@QueryParam("unidades") List<Long> unidades) {
        return service.autoCompleteComUnidades2(unidades);
    }


    @GET
    @Path("/buscar-cursos-da-unidade")
    public Uni<List<Long>> buscarCursosDaUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarCursosDaUnidade(unidadeId);
    }


    @GET
    @Path("/buscar-curriculo-por-unidades")
    public Uni<List<Long>> buscarCurriculoPorUnidades(@QueryParam("unidade") List<Long> unidade) {
        return service.buscarCurriculoPorUnidades(unidade);
    }

}
