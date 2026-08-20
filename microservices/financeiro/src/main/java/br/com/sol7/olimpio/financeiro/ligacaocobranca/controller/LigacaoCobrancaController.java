package br.com.sol7.olimpio.financeiro.ligacaocobranca;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/ligacao-cobranca")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LigacaoCobrancaController {
    @Inject
    LigacaoCobrancaService service;

    @GET
    public Uni<List<LigacaoCobrancaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<LigacaoCobrancaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size, @QueryParam("etapasCobrancaId") Long etapasCobrancaId, @QueryParam("semEtapa") Boolean semEtapa) {
        if (semEtapa != null && semEtapa)
            return service.pagedSemEtapa(page == null ? 0 : page, size == null ? 10 : size);
        if (etapasCobrancaId != null)
            return service.pagedPorEtapa(etapasCobrancaId, page == null ? 0 : page, size == null ? 10 : size);
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<LigacaoCobrancaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid LigacaoCobrancaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<LigacaoCobrancaResponse> update(@PathParam("id") Long id, @Valid LigacaoCobrancaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/paged-por-etapa")
    public Uni<PagedResponse<LigacaoCobrancaResponse>> pagedPorEtapa(@QueryParam("etapasCobrancaId") Long etapasCobrancaId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.pagedPorEtapa(etapasCobrancaId, page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/paged-sem-etapa")
    public Uni<PagedResponse<LigacaoCobrancaResponse>> pagedSemEtapa(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.pagedSemEtapa(page == null ? 0 : page, size == null ? 10 : size);
    }

}
