package br.com.sol7.olimpio.financeiro.gerircobranca;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/gerir-cobranca")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GerirCobrancaController {
    @Inject
    GerirCobrancaService service;

    @GET
    public Uni<List<GerirCobrancaResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<GerirCobrancaResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<GerirCobrancaResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid GerirCobrancaRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<GerirCobrancaResponse> update(@PathParam("id") Long id, @Valid GerirCobrancaRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/verificar-acesso")
    public Uni<Boolean> verificarAcesso(@QueryParam("tipo") String tipo, @QueryParam("modulo") String modulo) {
        return service.verificarAcesso(tipo, modulo);
    }


    @GET
    @Path("/carregar-cobrancas")
    public Uni<GerirCobrancaService.RelatorioCobranca> carregarCobrancas(
            @QueryParam("unidadeId") Long unidadeId,
            @QueryParam("mes") int mes,
            @QueryParam("ano") int ano) {
        return service.carregarCobrancas(unidadeId, mes, ano);
    }

}