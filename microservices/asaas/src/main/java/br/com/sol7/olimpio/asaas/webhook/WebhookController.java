package br.com.sol7.olimpio.asaas.webhook;

import br.com.sol7.olimpio.asaas.dto.WebHook;
import br.com.sol7.olimpio.asaas.parcela.FinAsaasParcelaResponse;
import br.com.sol7.olimpio.asaas.parcela.FinAsaasParcelaService;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Recebe os webhooks da API do Asaas (eventos PAYMENT_*) e espelha a cobrança
 * na tabela local fin_asaas_parcela, mantendo status, boleto/PIX e valores em dia
 * sem precisar consultar a API do Asaas a cada tela.
 */
@Path("/api/asaas/webhooks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WebhookController {

    @Inject
    FinAsaasParcelaService service;

    @POST
    public Uni<Response> receber(WebHook webhook) {
        return service.processarWebhook(webhook)
                .map(item -> Response.status(Response.Status.OK).entity(item).build());
    }

    @GET
    @Path("/health")
    public Uni<Response> health() {
        return Uni.createFrom().item(Response.ok("webhooks ok").build());
    }
}
