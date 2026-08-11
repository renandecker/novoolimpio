package br.com.sol7.olimpio.estoque.produtocampo;

import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.List;

@Path("/api/estoque/produto-campo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProdutoCampoController {

    @Inject ProdutoCampoService service;

    @GET public Uni<List<ProdutoCampoResponse>> list() { return service.list(); }
    @GET @Path("/paged") public Uni<PagedResponse<ProdutoCampoResponse>> paged(@QueryParam("page") Integer page, @QueryParam("size") Integer size) { return service.paged(page == null ? 0 : page, size == null ? 10 : size); }
    @GET @Path("/{id}") public Uni<ProdutoCampoResponse> find(@PathParam("id") Long id) { return service.find(id); }
    @POST public Uni<Response> create(@Valid ProdutoCampoRequest r) { return service.create(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build()); }
    @PUT @Path("/{id}") public Uni<ProdutoCampoResponse> update(@PathParam("id") Long id, @Valid ProdutoCampoRequest r) { return service.update(id, r); }
    @DELETE @Path("/{id}") public Uni<Void> delete(@PathParam("id") Long id) { return service.delete(id); }
}
