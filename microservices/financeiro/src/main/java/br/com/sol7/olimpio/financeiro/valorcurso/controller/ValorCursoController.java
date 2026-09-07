package br.com.sol7.olimpio.financeiro.valorcurso;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/valor-curso")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ValorCursoController {
    @Inject
    ValorCursoService service;

    @GET
    public Uni<List<ValorCursoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<ValorCursoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<ValorCursoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(ValorCursoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<ValorCursoResponse> update(@PathParam("id") Long id, ValorCursoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/{id}/unidades")
    public Uni<List<Integer>> listarUnidades(@PathParam("id") Long id) {
        return service.listarUnidades(id);
    }

    @PUT
    @Path("/{id}/unidades")
    public Uni<Void> substituirUnidades(@PathParam("id") Long id, List<Integer> unidadeIds) {
        return service.substituirUnidades(id, unidadeIds);
    }

    @GET
    @Path("/{id}/formas-pagamento")
    public Uni<List<Integer>> listarFormasPagamento(@PathParam("id") Long id) {
        return service.listarFormasPagamento(id);
    }

    @PUT
    @Path("/{id}/formas-pagamento")
    public Uni<Void> substituirFormasPagamento(@PathParam("id") Long id, List<Integer> formaPagamentoIds) {
        return service.substituirFormasPagamento(id, formaPagamentoIds);
    }

    @GET
    @Path("/{id}/descontos")
    public Uni<List<Integer>> listarDescontos(@PathParam("id") Long id) {
        return service.listarDescontos(id);
    }

    @PUT
    @Path("/{id}/descontos")
    public Uni<Void> substituirDescontos(@PathParam("id") Long id, List<Integer> descontoIds) {
        return service.substituirDescontos(id, descontoIds);
    }

    @GET
    @Path("/{id}/taxas")
    public Uni<List<Integer>> listarTaxas(@PathParam("id") Long id) {
        return service.listarTaxas(id);
    }

    @PUT
    @Path("/{id}/taxas")
    public Uni<Void> substituirTaxas(@PathParam("id") Long id, List<Integer> taxaIds) {
        return service.substituirTaxas(id, taxaIds);
    }
}
