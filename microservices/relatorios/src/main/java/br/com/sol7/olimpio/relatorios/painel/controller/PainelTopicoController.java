package br.com.sol7.olimpio.relatorios.painel.controller;

import br.com.sol7.olimpio.relatorios.painel.dto.PainelTopicoRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelTopicoResponse;
import br.com.sol7.olimpio.relatorios.painel.service.PainelTopicoService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/relatorios/painel-painel")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PainelTopicoController {

    @Inject
    PainelTopicoService service;

    @GET
    @Path("/painel/{painelId}")
    public Uni<List<PainelTopicoResponse>> findByPainelId(@PathParam("painelId") Long painelId) {
        return service.findByPainelId(painelId);
    }

    @POST
    public Uni<Response> create(@Valid PainelTopicoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<PainelTopicoResponse> update(@PathParam("id") Long id, @Valid PainelTopicoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}