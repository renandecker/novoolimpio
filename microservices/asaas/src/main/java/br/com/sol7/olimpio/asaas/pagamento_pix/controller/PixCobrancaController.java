package br.com.sol7.olimpio.asaas.pagamento_pix.controller;

import br.com.sol7.olimpio.asaas.pagamento_pix.dto.GerarCobrancaPixRequest;
import br.com.sol7.olimpio.asaas.pagamento_pix.dto.ParcelaPixResponse;
import br.com.sol7.olimpio.asaas.pagamento_pix.service.PixService;
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

import java.util.Map;

/**
 * Cobrancas PIX de parcelas (fluxo movido do fiserv, rota antiga
 * /api/pagamento/pix). Gera a cobranca no Asaas (PixProviderClient), persiste em
 * fin_parcela_pix e vincula fin_parcela.id_parcela_pix.
 */
@Path("/api/asaas/pix")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PixCobrancaController {

    @Inject
    PixService service;

    @POST
    public Uni<Response> gerar(@Valid GerarCobrancaPixRequest r) {
        return service.gerarCobranca(r).map(item -> Response.status(Response.Status.CREATED).entity(item).build());
    }

    @GET
    @Path("/{id}")
    public Uni<ParcelaPixResponse> consultar(@PathParam("id") Long id) {
        return service.consultar(id);
    }

    @GET
    @Path("/parcela/{idParcela}")
    public Uni<ParcelaPixResponse> consultarPorParcela(@PathParam("idParcela") Long idParcela) {
        return service.consultarPorParcela(idParcela);
    }

    @POST
    @Path("/{id}/atualizar-status")
    public Uni<ParcelaPixResponse> atualizarStatus(@PathParam("id") Long id) {
        return service.atualizarStatus(id);
    }

    @POST
    @Path("/enviar-email")
    public Uni<Map<String, String>> enviarEmail(Map<String, Object> request) {
        Long idParcela = ((Number) request.get("idParcela")).longValue();
        Long idPessoa = ((Number) request.get("idPessoa")).longValue();
        String qrcode = (String) request.get("qrcode");
        String chave = (String) request.get("chave");
        return service.enviarEmailPix(idParcela, idPessoa, qrcode, chave)
                .map(v -> Map.of("status", "enviado"))
                .onFailure().recoverWithItem(err -> Map.of("error", err.getMessage()));
    }
}
