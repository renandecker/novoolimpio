package br.com.sol7.olimpio.central.ordemligacao;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/central/ordem-ligacao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OrdemLigacaoController {
    @Inject
    OrdemLigacaoService service;

    @GET
    public Uni<List<OrdemLigacaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<OrdemLigacaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<OrdemLigacaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid OrdemLigacaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<OrdemLigacaoResponse> update(@PathParam("id") Long id, @Valid OrdemLigacaoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/proxima/{operacionalId}")
    public Uni<OrdemLigacaoResponse> buscarProxima(@PathParam("operacionalId") Long operacionalId) {
        return service.buscarProximaOrdemLigacao(operacionalId);
    }

    @GET
    @Path("/por-operacional/{operacionalId}")
    public Uni<List<OrdemLigacaoResponse>> buscarPorOperacional(@PathParam("operacionalId") Long operacionalId) {
        return service.buscarPorOperacional(operacionalId);
    }

    @GET
    @Path("/contar/{operacionalId}/{status}")
    public Uni<Long> contarPorOperacionalEStatus(@PathParam("operacionalId") Long operacionalId, @PathParam("status") String status) {
        return service.contarPorOperacionalEStatus(operacionalId, status);
    }

    @GET
    @Path("/contar-prioritarias/{operacionalId}")
    public Uni<Long> contarPrioritariasPorOperacional(@PathParam("operacionalId") Long operacionalId) {
        return service.contarPrioritariasPorOperacional(operacionalId);
    }

    @PUT
    @Path("/{id}/status/{status}")
    public Uni<OrdemLigacaoResponse> atualizarStatus(@PathParam("id") Long id, @PathParam("status") String status) {
        return service.atualizarStatus(id, status);
    }

    @PUT
    @Path("/{id}/incrementar-tentativa")
    public Uni<OrdemLigacaoResponse> incrementarTentativa(@PathParam("id") Long id) {
        return service.incrementarTentativa(id);
    }

    @POST
    @Path("/search")
    public Uni<PagedResponse<OrdemLigacaoResponse>> search(SearchFilterRequest request,
            @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.search(request, page == null ? 0 : page, size == null ? 10 : size);
    }
}