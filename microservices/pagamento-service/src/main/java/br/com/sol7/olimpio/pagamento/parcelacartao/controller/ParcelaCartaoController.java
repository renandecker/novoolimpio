package br.com.sol7.olimpio.pagamento.parcelacartao.controller;

import br.com.sol7.olimpio.pagamento.parcelacartao.dto.PagamentoCartaoRequest;
import br.com.sol7.olimpio.pagamento.parcelacartao.dto.ParcelaCartaoResponse;
import br.com.sol7.olimpio.pagamento.parcelacartao.service.ParcelaCartaoService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/pagamento/cartao")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ParcelaCartaoController {

    @Inject ParcelaCartaoService service;

    /** Efetua a cobranca (VISTA ou PARCELADO) e vincula o resultado a fin_parcela.id_parcela_cartao. */
    @POST
    public Uni<Response> pagar(@Valid PagamentoCartaoRequest r) {
        return service.pagar(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @GET
    @Path("/{id}")
    public Uni<ParcelaCartaoResponse> buscar(@PathParam("id") Long id) {
        return service.buscar(id);
    }
}
