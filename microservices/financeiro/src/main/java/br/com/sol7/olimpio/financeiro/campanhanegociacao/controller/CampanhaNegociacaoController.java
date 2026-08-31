package br.com.sol7.olimpio.financeiro.campanhanegociacao;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/campanha-negociacao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CampanhaNegociacaoController {
    @Inject
    CampanhaNegociacaoService service;

    @GET
    public Uni<List<CampanhaNegociacaoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CampanhaNegociacaoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CampanhaNegociacaoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CampanhaNegociacaoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CampanhaNegociacaoResponse> update(@PathParam("id") Long id, @Valid CampanhaNegociacaoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @POST
    @Path("/trigger/parcela-zero-atrito")
    public Uni<CampanhaNegociacaoResponse> triggerParcelaZeroAtrito(@QueryParam("mes") Integer mes, @QueryParam("clienteId") Long clienteId) {
        return service.triggerPorAtrasoRecente(clienteId, mes != null ? mes : java.time.LocalDate.now().getDayOfMonth());
    }

    @POST
    @Path("/trigger/troca-desconto")
    public Uni<CampanhaNegociacaoResponse> triggerTrocaDesconto(@QueryParam("mes") Integer mes, @QueryParam("clienteId") Long clienteId) {
        return service.triggerPorLiquidezRapida(clienteId);
    }

    @POST
    @Path("/trigger/segunda-chance")
    public Uni<CampanhaNegociacaoResponse> triggerSegundaChance(@QueryParam("mes") Integer mes, @QueryParam("clienteId") Long clienteId) {
        return service.triggerPorPrevencaoInadimplencia(clienteId);
    }

    @POST
    @Path("/trigger/quita-facil")
    public Uni<CampanhaNegociacaoResponse> triggerQuitaFacil(@QueryParam("mes") Integer mes, @QueryParam("clienteId") Long clienteId) {
        return service.triggerPorEngajamento(clienteId);
    }
}