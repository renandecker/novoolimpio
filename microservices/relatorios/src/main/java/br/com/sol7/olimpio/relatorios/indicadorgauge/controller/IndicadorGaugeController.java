package br.com.sol7.olimpio.relatorios.indicadorgauge.controller;

import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeRequest;
import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeResponse;
import br.com.sol7.olimpio.relatorios.indicadorgauge.dto.IndicadorGaugeExecutarRequest;
import br.com.sol7.olimpio.relatorios.indicadorgauge.service.IndicadorGaugeService;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

@Path("/api/relatorios/indicador-gauge")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class IndicadorGaugeController {

    @Inject
    IndicadorGaugeService service;

    @GET
    @Path("/disponiveis")
    public Uni<PagedResponse<IndicadorGaugeResponse>> listarDisponiveis(
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("busca") String busca) {
        return service.listarDisponiveis(page == null ? 0 : page, size == null ? 10 : size, busca);
    }

    @GET
    @Path("/{id}")
    public Uni<IndicadorGaugeResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid IndicadorGaugeRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<IndicadorGaugeResponse> update(@PathParam("id") Long id, @Valid IndicadorGaugeRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/executar")
    public Uni<IndicadorGaugeService.IndicadorGaugeExecucaoResponse> executar(@Valid IndicadorGaugeExecutarRequest request) {
        return service.executar(request.sql(), request.indicadorGaugeId(), request.filtros());
    }
}