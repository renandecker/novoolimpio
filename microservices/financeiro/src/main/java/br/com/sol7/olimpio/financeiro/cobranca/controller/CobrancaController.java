package br.com.sol7.olimpio.financeiro.cobranca;

import br.com.sol7.olimpio.financeiro.shared.rabbitmq.FinanceiroRabbitMQProducer;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/cobranca")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CobrancaController {
    @Inject
    CobrancaService service;

    @Inject
    FinanceiroRabbitMQProducer rabbitMQProducer;

    @GET
    public Uni<List<CobrancaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CobrancaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CobrancaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CobrancaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CobrancaResponse> update(@PathParam("id") Long id, @Valid CobrancaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/atualizar")
    public Uni<Void> atualizar() {
        return service.atualizar();
    }


    @GET
    @Path("/buscar-cobranca")
    public Uni<Float> buscarCobranca(@QueryParam("parcelaId") Long parcelaId) {
        return service.buscarCobranca(parcelaId);
    }


    @POST
    @Path("/atualizar-cobrancas-automatico")
    public Uni<Response> atualizarCobrancasAutomatico() {
        return rabbitMQProducer.enviarTriggerAtualizarCobrancas("atualizarCobrancasAutomatico")
                .map(v -> Response.accepted().entity(java.util.Map.of("status", "trigger enviado", "action", "atualizarCobrancasAutomatico")).build());
    }

}
