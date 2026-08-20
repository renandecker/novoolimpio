package br.com.sol7.olimpio.pagamento.gateway.fiserv.webhook;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Endpoint de webhook da Fiserv Commerce Hub. Publico (sem JWT - ver JwtAuthenticationFilter),
 * pois quem chama e a Fiserv. A confirmacao assincrona de pagamento/cancelamento e aplicada em
 * fin_parcela_cartao e, quando necessario, o evento Kafka de pagamento confirmado e publicado.
 */
@Path("/api/pagamento/webhook/fiserv")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FiservWebhookController {

    @Inject
    FiservWebhookService service;

    @POST
    public Uni<Response> receber(JsonNode payload) {
        return service.processar(payload).map(v -> Response.ok().build());
    }
}
