package br.com.sol7.olimpio.basico.financobanco.controller;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

import br.com.sol7.olimpio.basico.financobanco.dto.FinBancoRequest;
import br.com.sol7.olimpio.basico.financobanco.dto.FinBancoResponse;
import br.com.sol7.olimpio.basico.financobanco.service.FinBancoService;

@Path("/api/basico/fin-banco")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FinBancoController {

    @Inject
    FinBancoService service;

    @GET
    public Uni<List<FinBancoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<FinBancoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<FinBancoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @GET
    @Path("/config")
    public Uni<Map<String, String>> config(@QueryParam("unidadeId") Long unidadeId,
                                           @QueryParam("provedor") String provedor) {
        return service.getConfiguracao(unidadeId, provedor);
    }

    @POST
    public Uni<Response> create(@Valid FinBancoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<FinBancoResponse> update(@PathParam("id") Long id, @Valid FinBancoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }
}
