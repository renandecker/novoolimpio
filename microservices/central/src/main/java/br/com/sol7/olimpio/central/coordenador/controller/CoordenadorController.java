package br.com.sol7.olimpio.central.coordenador;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;
import java.util.Map;

@Path("/api/central/coordenador")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CoordenadorController {
    @Inject
    CoordenadorService service;

    @GET
    public Uni<List<CoordenadorResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CoordenadorResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/paged-enriched")
    public Uni<PagedResponse<Map<String,Object>>> pagedEnriched(@QueryParam("page") Integer page, @QueryParam("size") Integer size,
                                                               @QueryParam("operadorLogin") String operadorLogin,
                                                               @QueryParam("coordenadorLogin") String coordenadorLogin,
                                                               @QueryParam("data") String data) {
        return service.pagedEnriched(page == null ? 0 : page, size == null ? 10 : size, operadorLogin, coordenadorLogin, data);
    }

    @GET
    @Path("/{id}")
    public Uni<CoordenadorResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CoordenadorRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CoordenadorResponse> update(@PathParam("id") Long id, @Valid CoordenadorRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete")
    public Uni<List<Map<String,Object>>> autoComplete(@QueryParam("query") String query) {
        return service.autoCompleteCoordenador(query);
    }

    @GET
    @Path("/auto-complete-coordenador")
    public Uni<List<Map<String,Object>>> autoCompleteCoordenador(@QueryParam("query") String query) {
        return service.autoCompleteCoordenador(query);
    }

    @GET
    @Path("/{id}/turnos")
    public Uni<String> obterTurnos(@PathParam("id") Long operadorId) {
        return service.obterTurnos(operadorId);
    }

    @GET
    @Path("/{id}/situacao")
    public Uni<String> situacao(@PathParam("id") Long operadorId) {
        return service.situacao(operadorId);
    }

    @POST
    @Path("/{id}/pausar")
    public Uni<Void> pausar(@PathParam("id") Long operadorId, @QueryParam("usuarioLogadoId") Long usuarioLogadoId) {
        return service.pausarOperador(operadorId, usuarioLogadoId);
    }

    @POST
    @Path("/{id}/despausar")
    public Uni<Void> despausar(@PathParam("id") Long operadorId) {
        return service.removerPausa(operadorId);
    }

    @GET
    @Path("/{id}/ligacoes")
    public Uni<List<Map<String,Object>>> ligacoes(@PathParam("id") Long operadorId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.listarLigacoes(operadorId, page==null?0:page, size==null?10:size);
    }

    @GET
    @Path("/{id}/ordem-ligacoes")
    public Uni<List<Map<String,Object>>> ordemLigacoes(@PathParam("id") Long operadorId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.listarOrdemLigacoes(operadorId, page==null?0:page, size==null?10:size);
    }

    @GET
    @Path("/{id}/fila-prioritaria")
    public Uni<List<Map<String,Object>>> filaPrioritaria(@PathParam("id") Long operadorId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.listarFilaPrioritaria(operadorId, page==null?0:page, size==null?10:size);
    }

    @GET
    @Path("/{id}/pausas")
    public Uni<List<Map<String,Object>>> pausas(@PathParam("id") Long operadorId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.listarPausas(operadorId, page==null?0:page, size==null?10:size);
    }

    @GET
    @Path("/{id}/compromissos")
    public Uni<List<Map<String,Object>>> compromissos(@PathParam("id") Long operadorId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.listarCompromissos(operadorId, page==null?0:page, size==null?10:size);
    }

    @GET
    @Path("/{id}/pie")
    public Uni<Map<String,Object>> pie(@PathParam("id") Long operadorId) {
        return service.buscarLigacoesPie(operadorId);
    }

    @POST
    @Path("/troca-prioritaria")
    public Uni<Void> trocaPrioritaria(@QueryParam("de") Long deOperadorId, @QueryParam("para") Long paraOperadorId) {
        return service.confirmaTrocaPrioritaria(deOperadorId, paraOperadorId);
    }

    @POST
    @Path("/{id}/redistribuir")
    public Uni<Void> redistribuir(@PathParam("id") Long operadorId) {
        return service.confirmaTrocaLigacao(operadorId);
    }

    @GET
    @Path("/buscar-ligacoes-prioritarias")
    public Uni<Void> buscarLigacoesPrioritariasLegacy() {
        return Uni.createFrom().voidItem();
    }

    @GET
    @Path("/buscar-ligacoes")
    public Uni<Void> buscarLigacoesLegacy(@QueryParam("opId") Long opId) {
        return Uni.createFrom().voidItem();
    }

    @GET
    @Path("/telefonos-prospecto")
    public Uni<List<String>> telefonesProspecto(@QueryParam("prospectoId") Long prospectoId) {
        return service.telefonesProspecto(prospectoId);
    }
}
