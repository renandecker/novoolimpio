package br.com.sol7.olimpio.pagamento.cartaopessoa.controller;

import br.com.sol7.olimpio.pagamento.cartaopessoa.dto.CadastrarCartaoRequest;
import br.com.sol7.olimpio.pagamento.cartaopessoa.dto.CartaoPessoaResponse;
import br.com.sol7.olimpio.pagamento.cartaopessoa.service.CartaoPessoaService;
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

    @Inject CartaoPessoaService service;

    @GET
    public Uni<List<CartaoPessoaResponse>> listar(@QueryParam("idPessoa") Long idPessoa) {
        return service.listarPorPessoa(idPessoa);
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
}
