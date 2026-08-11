package br.com.sol7.olimpio.pagamento.gateway.fiserv;

import com.fasterxml.jackson.databind.JsonNode;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Endpoints da Fiserv Commerce Hub / Payments Gateway (IPP) usados por este microsservico -
 * extraidos da collection "fiserv.dev" (pasta Ecommerce/Payments - Live).
 *
 * O corpo e enviado como String JA SERIALIZADA (ver FiservGatewayService), pois a assinatura
 * HMAC (Message-Signature) precisa ser calculada sobre os MESMOS bytes que serao enviados.
 */
@RegisterRestClient
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public interface FiservPaymentClient {

    /** POST /ipp/payments-gateway/v2/payments - venda a vista (PaymentCardSaleTransaction / PaymentTokenSaleTransaction). */
    @POST
    @Path("/ipp/payments-gateway/v2/payments")
    Uni<JsonNode> criarPagamento(
            @HeaderParam("Api-Key") String apiKey,
            @HeaderParam("Client-Request-Id") String clientRequestId,
            @HeaderParam("Timestamp") String timestamp,
            @HeaderParam("Message-Signature") String messageSignature,
            String requestBodyJson);

    /** GET /ipp/payments-gateway/v2/payments/{ipgTransactionId} - consulta o estado de uma transacao. */
    @GET
    @Path("/ipp/payments-gateway/v2/payments/{ipgTransactionId}")
    Uni<JsonNode> consultarPagamento(
            @PathParam("ipgTransactionId") String ipgTransactionId,
            @HeaderParam("Api-Key") String apiKey,
            @HeaderParam("Client-Request-Id") String clientRequestId,
            @HeaderParam("Timestamp") String timestamp,
            @HeaderParam("Message-Signature") String messageSignature);

    /** POST /ipp/payments-gateway/v2/payment-schedules - cria o parcelamento (venda parcelada). */
    @POST
    @Path("/ipp/payments-gateway/v2/payment-schedules")
    Uni<JsonNode> criarPaymentSchedule(
            @HeaderParam("Api-Key") String apiKey,
            @HeaderParam("Client-Request-Id") String clientRequestId,
            @HeaderParam("Timestamp") String timestamp,
            @HeaderParam("Message-Signature") String messageSignature,
            String requestBodyJson);

    /** GET /ipp/payments-gateway/v2/payment-schedules/{orderId} - consulta um parcelamento. */
    @GET
    @Path("/ipp/payments-gateway/v2/payment-schedules/{orderId}")
    Uni<JsonNode> consultarPaymentSchedule(
            @PathParam("orderId") String orderId,
            @HeaderParam("Api-Key") String apiKey,
            @HeaderParam("Client-Request-Id") String clientRequestId,
            @HeaderParam("Timestamp") String timestamp,
            @HeaderParam("Message-Signature") String messageSignature);

    /** POST /ipp/payments-gateway/v2/payment-tokens - cadastra/tokeniza um cartao (sem cobranca). */
    @POST
    @Path("/ipp/payments-gateway/v2/payment-tokens")
    Uni<JsonNode> criarPaymentToken(
            @HeaderParam("Api-Key") String apiKey,
            @HeaderParam("Client-Request-Id") String clientRequestId,
            @HeaderParam("Timestamp") String timestamp,
            @HeaderParam("Message-Signature") String messageSignature,
            String requestBodyJson);

    /** DELETE nao mapeado neste MVP - ver README para evolucao (cancelamento/estorno via PATCH em /payments/{id}). */
}
