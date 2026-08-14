package br.com.sol7.olimpio.pagamento.pagamento.controller;

import br.com.sol7.olimpio.pagamento.pagamento.dto.EfetuarPagamentoRequest;
import br.com.sol7.olimpio.pagamento.pagamento.service.PagamentoService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Endpoint unico para pagar uma parcela (fin_parcela) via cartao (a vista ou parcelado).
 * Para operacoes especificas de cada forma use os controllers dedicados: /api/pagamento/cartao,
 * /api/pagamento/cartao-pessoa. O fluxo PIX foi movido para o asaas-service (rota /api/asaas/pix).
 */
@Path("/api/pagamento")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PagamentoController {

    @Inject PagamentoService service;

    @POST
    public Uni<Response> efetuar(@Valid EfetuarPagamentoRequest r) {
        return service.efetuar(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }
}
