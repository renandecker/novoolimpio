package br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.controller;

import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.dto.CurriculoAtividadeComplementarRequest;
import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.dto.CurriculoAtividadeComplementarResponse;
import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.service.CurriculoAtividadeComplementarService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/educacao/curriculo-atividade-complementar")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CurriculoAtividadeComplementarController {
    @Inject
    CurriculoAtividadeComplementarService service;

    @GET
    public Uni<List<CurriculoAtividadeComplementarResponse>> list(@QueryParam("curriculoId") Long curriculoId) {
        return curriculoId != null ? service.listarPorCurriculo(curriculoId) : service.list();
    }

    @POST
    public Uni<Response> create(@Valid CurriculoAtividadeComplementarRequest r) {
        return service.create(r).map(item -> Response.ok(item).build());
    }

    @DELETE
    public Uni<Void> delete(@QueryParam("curriculoId") Long curriculoId, @QueryParam("atividadeComplementarId") Long atividadeComplementarId) {
        return service.delete(curriculoId, atividadeComplementarId);
    }

    @DELETE
    @Path("/{atividadeComplementarId}")
    public Uni<Void> deleteByPath(@QueryParam("curriculoId") Long curriculoId, @PathParam("atividadeComplementarId") Long atividadeComplementarId) {
        return service.delete(curriculoId, atividadeComplementarId);
    }
}
