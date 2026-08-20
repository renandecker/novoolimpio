package br.com.sol7.olimpio.educacao.resultadoligacaonap;

import br.com.sol7.olimpio.educacao.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/educacao/resultado-ligacao-nap")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ResultadoLigacaoNAPController {
    @Inject
    ResultadoLigacaoNAPService service;

    @GET
    public Uni<List<ResultadoLigacaoNAPResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ResultadoLigacaoNAPResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ResultadoLigacaoNAPResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid ResultadoLigacaoNAPRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ResultadoLigacaoNAPResponse> update(@PathParam("id") Long id, @Valid ResultadoLigacaoNAPRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-com-etapa")
    public Uni<List<Long>> autoCompleteComEtapa(@QueryParam("query") String query) {
        return service.autoCompleteComEtapa(query);
    }


    @GET
    @Path("/auto-complete")
    public Uni<List<Long>> autoComplete(@QueryParam("query") String query) {
        return service.autoComplete(query);
    }


    @GET
    @Path("/buscar-resultado-ligacao-n-a-p-com-etapas")
    public Uni<Long> buscarResultadoLigacaoNAPComEtapas(@QueryParam("resultadoLigacaoNAPId") Long resultadoLigacaoNAPId) {
        return service.buscarResultadoLigacaoNAPComEtapas(resultadoLigacaoNAPId);
    }


    @GET
    @Path("/auto-complete-com-etapa2")
    public Uni<List<Long>> autoCompleteComEtapa2(@QueryParam("query") String query, @QueryParam("etapasCobrancaId") Long etapasCobrancaId) {
        return service.autoCompleteComEtapa2(query, etapasCobrancaId);
    }

}
