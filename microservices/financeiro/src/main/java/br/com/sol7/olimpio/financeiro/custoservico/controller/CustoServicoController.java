package br.com.sol7.olimpio.financeiro.custoservico;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/financeiro/custo-servico")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustoServicoController {
    @Inject
    CustoServicoService service;

    @GET
    public Uni<List<CustoServicoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<CustoServicoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<CustoServicoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid CustoServicoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<CustoServicoResponse> update(@PathParam("id") Long id, @Valid CustoServicoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }


    @GET
    @Path("/buscar-custo-servico-com-unidade")
    public Uni<Long> buscarCustoServicoComUnidade(@QueryParam("custoServicoId") Long custoServicoId) {
        return service.buscarCustoServicoComUnidade(custoServicoId);
    }


    @GET
    @Path("/buscar-custo-servico-por-unidade")
    public Uni<Long> buscarCustoServicoPorUnidade(@QueryParam("unidadeId") Long unidadeId) {
        return service.buscarCustoServicoPorUnidade(unidadeId);
    }

}
