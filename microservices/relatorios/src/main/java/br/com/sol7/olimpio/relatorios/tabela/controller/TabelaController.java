package br.com.sol7.olimpio.relatorios.tabela;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaResponse;
import br.com.sol7.olimpio.relatorios.tabela.dto.TabelaRequest;

@Path("/api/relatorios/tabela")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TabelaController {
    @Inject
    TabelaService service;

    @GET
    public Uni<List<TabelaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<TabelaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}/executar")
    public Uni<br.com.sol7.olimpio.relatorios.tabela.dto.TabelaExecutadaResponse> executar(@PathParam("id") Long id, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.executar(id, page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<TabelaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid TabelaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<TabelaResponse> update(@PathParam("id") Long id, @Valid TabelaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/gerar-sql")
    public Uni<String> gerarSql() {
        return service.gerarSql();
    }


    @GET
    @Path("/buscar-medidas")
    public Uni<Void> buscarMedidas(@QueryParam("fatoId") Long fatoId) {
        return service.buscarMedidas(fatoId);
    }


    @GET
    @Path("/buscar-dimensoes-descritivo")
    public Uni<Void> buscarDimensoesDescritivo(@QueryParam("fatoId") Long fatoId) {
        return service.buscarDimensoesDescritivo(fatoId);
    }


    @GET
    @Path("/buscar-dimensoes-tempo")
    public Uni<Void> buscarDimensoesTempo(@QueryParam("fatoId") Long fatoId) {
        return service.buscarDimensoesTempo(fatoId);
    }


    @GET
    @Path("/buscar-unidades")
    public Uni<List<Long>> buscarUnidades(@QueryParam("id") Long id) {
        return service.buscarUnidades(id);
    }


    @GET
    @Path("/buscar-perfils")
    public Uni<List<Long>> buscarPerfils(@QueryParam("id") Long id) {
        return service.buscarPerfils(id);
    }


    @GET
    @Path("/buscar-usuarios")
    public Uni<List<Long>> buscarUsuarios(@QueryParam("id") Long id) {
        return service.buscarUsuarios(id);
    }


    @GET
    @Path("/buscar-tabela-pelo-fato")
    public Uni<List<Long>> buscarTabelaPeloFato(@QueryParam("fatoId") Long fatoId) {
        return service.buscarTabelaPeloFato(fatoId);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query, @QueryParam("estruturaId") Long estruturaId) {
        return service.autoComplete(query, estruturaId);
    }

}
