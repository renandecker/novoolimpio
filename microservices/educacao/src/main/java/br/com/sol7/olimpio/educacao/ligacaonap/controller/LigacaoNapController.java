package br.com.sol7.olimpio.educacao.ligacaonap;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/ligacao-nap")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LigacaoNapController {
    @Inject
    LigacaoNapService service;

    @GET
    public Uni<List<LigacaoNapResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<LigacaoNapResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size, @QueryParam("etapasNapId") Long etapasNapId, @QueryParam("semEtapa") Boolean semEtapa) {
        if (semEtapa != null && semEtapa)
            return service.pagedSemEtapa(page == null ? 0 : page, size == null ? 10 : size);
        if (etapasNapId != null)
            return service.pagedPorEtapa(etapasNapId, page == null ? 0 : page, size == null ? 10 : size);
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<LigacaoNapResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid LigacaoNapRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<LigacaoNapResponse> update(@PathParam("id") Long id, @Valid LigacaoNapRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/paged-por-etapa")
    public Uni<PagedResponse<LigacaoNapResponse>> pagedPorEtapa(@QueryParam("etapasNapId") Long etapasNapId, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.pagedPorEtapa(etapasNapId, page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/paged-sem-etapa")
    public Uni<PagedResponse<LigacaoNapResponse>> pagedSemEtapa(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.pagedSemEtapa(page == null ? 0 : page, size == null ? 10 : size);
    }

}

