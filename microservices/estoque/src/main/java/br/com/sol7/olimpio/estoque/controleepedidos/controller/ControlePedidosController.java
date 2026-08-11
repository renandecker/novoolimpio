package br.com.sol7.olimpio.estoque.controleepedidos;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.Date;
import java.util.List;

@Path("/api/estoque/controle-pedidos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ControlePedidosController {

    @Inject ControlePedidosService service;

    @GET public Uni<List<ControlePedidosResponse>> list() { return service.list(); }
    @GET @Path("/paged") public Uni<PagedResponse<ControlePedidosResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) { return service.paged(page == null ? 0 : page, size == null ? 10 : size); }

    @GET
    @Path("/listar-pedidos")
    public Uni<List<ControlePedidosResponse>> listarPedidos(@QueryParam("unidadeId") Long unidadeId, @QueryParam("inicio") Date inicio, @QueryParam("fim") Date fim) {
        return service.listarPedidos(unidadeId, inicio, fim);
    }

    @GET
    @Path("/listar-pedidos-sem-entrega")
    public Uni<List<ControlePedidosResponse>> listarPedidosSemEntrega(@QueryParam("unidadeId") Long unidadeId) {
        return service.listarPedidosSemEntrega(unidadeId);
    }

    @GET
    @Path("/count-aprovado-nao-entregue")
    public Uni<Long> countAprovadoNaoEntregue(@QueryParam("unidadeId") Long unidadeId, @QueryParam("produtoId") Long produtoId) {
        return service.countAprovadoNaoEntregue(unidadeId, produtoId);
    }

    @GET
    @Path("/solicitacao/{solicitacaoEstoqueId}")
    public Uni<List<ControlePedidosResponse>> listBySolicitacao(@PathParam("solicitacaoEstoqueId") Long solicitacaoEstoqueId) {
        return service.listBySolicitacao(solicitacaoEstoqueId);
    }

    @GET @Path("/{id}") public Uni<ControlePedidosResponse> find(@PathParam("id") Long id) { return service.find(id); }
    @POST public Uni<Response> create(@Valid ControlePedidosRequest r) { return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build()); }
    @PUT @Path("/{id}") public Uni<ControlePedidosResponse> update(@PathParam("id") Long id, @Valid ControlePedidosRequest r) { return service.update(id, r); }
    @DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id) { return service.delete(id); }
}
