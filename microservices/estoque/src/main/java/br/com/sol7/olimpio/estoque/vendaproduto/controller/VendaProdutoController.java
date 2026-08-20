package br.com.sol7.olimpio.estoque.vendaproduto;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.List;

@Path("/api/estoque/venda-produto")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VendaProdutoController {
    @Inject
    VendaProdutoService service;

    @GET
    public Uni<List<VendaProdutoResponse>> list() {
        return service.list();
    }

    @GET
    @Path("/paged")
    public Uni<PagedResponse<VendaProdutoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return service.paged(page == null ? 0 : page, size == null ? 10 : size);
    }

    @GET
    @Path("/{id}")
    public Uni<VendaProdutoResponse> find(@PathParam("id") Long id) {
        return service.find(id);
    }

    @POST
    public Uni<Response> create(@Valid VendaProdutoRequest r) {
        return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @PUT
    @Path("/{id}")
    public Uni<VendaProdutoResponse> update(@PathParam("id") Long id, @Valid VendaProdutoRequest r) {
        return service.update(id, r);
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> delete(@PathParam("id") Long id) {
        return service.delete(id);
    }

    @GET
    @Path("/auto-complete-aluno")
    public Uni<List<Long>> autoCompleteAluno(@QueryParam("query") String query) {
        return service.autoCompleteAluno(query);
    }


    @GET
    @Path("/carregar-vendas")
    public Uni<Void> carregarVendas(@QueryParam("unidadeId") Long unidadeId) {
        return service.carregarVendas(unidadeId);
    }


    @GET
    @Path("/buscar-produto")
    public Uni<Void> buscarProduto() {
        return service.buscarProduto();
    }


    @GET
    @Path("/buscar-formas-pagamento")
    public Uni<List<Long>> buscarFormasPagamento() {
        return service.buscarFormasPagamento();
    }


    @GET
    @Path("/auto-complete-produto")
    public Uni<List<Long>> autoCompleteProduto(@QueryParam("query") String query) {
        return service.autoCompleteProduto(query);
    }

}