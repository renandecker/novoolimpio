package br.com.sol7.olimpio.pagamento.pix.controller;

import br.com.sol7.olimpio.pagamento.pix.dto.GerarCobrancaPixRequest;
import br.com.sol7.olimpio.pagamento.pix.dto.ParcelaPixResponse;
import br.com.sol7.olimpio.pagamento.pix.service.PixService;
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

@Path("/api/pagamento/pix")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PixController {

    @Inject PixService service;

    @POST
    public Uni<Response> gerar(@Valid GerarCobrancaPixRequest r) {
        return service.gerarCobranca(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @GET
    @Path("/{id}")
    public Uni<ParcelaPixResponse> consultar(@PathParam("id") Long id) {
        return service.consultar(id);
    }

    @POST
    @Path("/{id}/atualizar-status")
    public Uni<ParcelaPixResponse> atualizarStatus(@PathParam("id") Long id) {
        return service.atualizarStatus(id);
    }
}
