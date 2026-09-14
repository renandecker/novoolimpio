package br.com.sol7.olimpio.pagamento.cartaopessoa.controller;

import br.com.sol7.olimpio.pagamento.cartaopessoa.dto.CadastrarCartaoRequest;
import br.com.sol7.olimpio.pagamento.cartaopessoa.dto.CartaoPessoaResponse;
import br.com.sol7.olimpio.pagamento.cartaopessoa.entity.CartaoPessoa;
import br.com.sol7.olimpio.pagamento.cartaopessoa.service.CartaoPessoaService;
import br.com.sol7.olimpio.shared.GenericSearchService;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/pagamento/cartao-pessoa")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CartaoPessoaController {

    @Inject
    CartaoPessoaService service;

    @Inject
    GenericSearchService searchService;

    @GET
    public Uni<List<CartaoPessoaResponse>> listar(@QueryParam("idPessoa") Long idPessoa) {
        return service.listarPorPessoa(idPessoa);
    }

    @GET
    @Path("/paged")
    @WithSession
    public Uni<PagedResponse<CartaoPessoaResponse>> listarPaged(@QueryParam("page") int page, @QueryParam("size") int size,
            @QueryParam("sort") String sort, @QueryParam("order") String order, @QueryParam("idPessoa") Long idPessoa) {
        SearchFilterRequest filterRequest = null;
        if (idPessoa != null) {
            filterRequest = new SearchFilterRequest(java.util.Map.of("idPessoa", new SearchFilterRequest.FilterCondition("EQUALS", idPessoa.toString(), null)));
        }
        return searchService.search(CartaoPessoa.class, filterRequest, page, size, sort, order)
                .map(this::mapToResponse);
    }

    @POST
    @Path("/search")
    @WithSession
    public Uni<PagedResponse<CartaoPessoaResponse>> search(SearchFilterRequest request, @QueryParam("page") int page, @QueryParam("size") int size,
            @QueryParam("sort") String sort, @QueryParam("order") String order) {
        return searchService.search(CartaoPessoa.class, request, page, size, sort, order)
                .map(this::mapToResponse);
    }

    @POST
    public Uni<Response> cadastrar(@Valid CadastrarCartaoRequest r) {
        return service.cadastrar(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @DELETE
    @Path("/{id}")
    public Uni<Void> inativar(@PathParam("id") Long id, @QueryParam("idPessoa") Long idPessoa) {
        return service.inativar(idPessoa, id);
    }

    private PagedResponse<CartaoPessoaResponse> mapToResponse(PagedResponse<CartaoPessoa> entityResponse) {
        List<CartaoPessoaResponse> content = entityResponse.content().stream().map(service::toResponse).toList();
        return new PagedResponse<>(content, entityResponse.totalElements(), entityResponse.page(), entityResponse.size(), entityResponse.totalPages());
    }
}
