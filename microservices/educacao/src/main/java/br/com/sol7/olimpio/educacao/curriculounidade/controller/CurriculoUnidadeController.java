package br.com.sol7.olimpio.educacao.curriculounidade;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/educacao/curriculo-unidade")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CurriculoUnidadeController {
    @Inject
    CurriculoUnidadeService service;

    @GET
    public Uni<List<CurriculoUnidadeResponse>> list(@QueryParam("curriculoId") Long curriculoId) {
        return curriculoId != null ? service.listarPorCurriculo(curriculoId) : service.list();
    }

    @POST
    public Uni<Response> create(@Valid CurriculoUnidadeRequest r) {
        return service.create(r).map(item -> Response.ok(item).build());
    }

    // A tabela usa chave composta (id_curriculo, id_unidade), sem coluna id.
    @DELETE
    public Uni<Void> delete(@QueryParam("curriculoId") Long curriculoId, @QueryParam("unidadeId") Long unidadeId) {
        return service.delete(curriculoId, unidadeId);
    }

    @DELETE
    @Path("/{unidadeId}")
    public Uni<Void> deleteByPath(@QueryParam("curriculoId") Long curriculoId, @PathParam("unidadeId") Long unidadeId) {
        return service.delete(curriculoId, unidadeId);
    }
}
