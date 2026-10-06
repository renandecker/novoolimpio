package br.com.sol7.olimpio.central.meta;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Path("/api/central/meta")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MetaController {
    @Inject
    MetaService service;

    @GET
    public Uni<List<MetaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<MetaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/paged-enriched")
    public Uni<PagedResponse<Map<String, Object>>> pagedEnriched(
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("operadorLogin") String operadorLogin,
            @QueryParam("operacionalId") Long operacionalId,
            @QueryParam("data") String dataStr) {
        return service.pagedEnriched(page == null ? 0 : page, size == null ? 10 : size, operadorLogin, operacionalId, dataStr);
    }

    @GET
    @Path("/{id}")
    public Uni<MetaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid MetaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<MetaResponse> update(@PathParam("id") Long id, @Valid MetaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/buscar-meta-operador-dia")
    public Uni<Integer> buscarMetaOperadorDia(@QueryParam("data") Date data, @QueryParam("operadorId") Long operadorId) {
        return service.buscarMetaOperadorDia(data, operadorId);
    }

    @GET
    @Path("/buscar-meta-operador-dia2")
    public Uni<Integer> buscarMetaOperadorDia2(@QueryParam("data") Date data, @QueryParam("operadorId") Long operadorId) {
        return service.buscarMetaOperadorDia(data, operadorId);
    }

    @GET
    @Path("/buscar-meta-operador")
    public Uni<Integer> buscarMetaOperador(@QueryParam("data") Date data, @QueryParam("operadorId") Long operadorId) {
        return service.buscarMetaOperador(data, operadorId);
    }

    @GET
    @Path("/buscar-conflito-datas-com-equipe")
    public Uni<List<Long>> buscarConflitoDatasComEquipe(@QueryParam("dataInicial") Date dataInicial, @QueryParam("dataFinal") Date dataFinal, @QueryParam("operacionalId") Long operacionalId) {
        return service.buscarConflitoDatasComEquipe(dataInicial, dataFinal, operacionalId);
    }

    @GET
    @Path("/buscar-conflito-datas-com-equipe-com-meta")
    public Uni<List<Long>> buscarConflitoDatasComEquipeComMeta(@QueryParam("dataInicial") Date dataInicial, @QueryParam("dataFinal") Date dataFinal, @QueryParam("operacionalId") Long operacionalId, @QueryParam("id") Integer id) {
        return service.buscarConflitoDatasComEquipeComMeta(dataInicial, dataFinal, operacionalId, id);
    }

    @GET
    @Path("/buscar-conflito-datas-com-operador")
    public Uni<List<Long>> buscarConflitoDatasComOperador(@QueryParam("dataInicial") Date dataInicial, @QueryParam("dataFinal") Date dataFinal, @QueryParam("operadorId") Long operadorId) {
        return service.buscarConflitoDatasComOperador(dataInicial, dataFinal, operadorId);
    }

    @GET
    @Path("/buscar-conflito-datas-com-operador-com-meta")
    public Uni<List<Long>> buscarConflitoDatasComOperadorComMeta(@QueryParam("dataInicial") Date dataInicial, @QueryParam("dataFinal") Date dataFinal, @QueryParam("operadorId") Long operadorId, @QueryParam("id") Integer id) {
        return service.buscarConflitoDatasComOperadorComMeta(dataInicial, dataFinal, operadorId, id);
    }

    @GET
    @Path("/buscar-meta-operador-periodo")
    public Uni<Integer> buscarMetaOperadorPeriodo(@QueryParam("data") Date data, @QueryParam("operadorId") Long operadorId) {
        return service.buscarMetaOperadorPeriodo(data, operadorId);
    }

    @GET
    @Path("/operadores-disponiveis")
    public Uni<List<Map<String, Object>>> operadoresDisponiveis(@QueryParam("coordenadorId") Long coordenadorId, @QueryParam("data") String data) {
        return service.operadoresDisponiveis(coordenadorId, data);
    }

    @GET
    @Path("/operacionais-do-coordenador")
    public Uni<List<Map<String, Object>>> operacionaisDoCoordenador(@QueryParam("coordenadorId") Long coordenadorId) {
        return service.operacionaisDoCoordenador(coordenadorId);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<MetaResponse>> search(SearchFilterRequest request,
            @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.search(request, page == null ? 0 : page, size == null ? 10 : size);
    }
}