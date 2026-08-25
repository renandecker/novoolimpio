package br.com.sol7.olimpio.pagamento.gateway.fiserv;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Gera os headers de autenticacao HMAC exigidos pela Fiserv Commerce Hub / Payments Gateway.
 * <p>
 * Algoritmo oficial (https://docs.fiserv.dev/public/docs/message-signature):
 * rawSignature   = apiKey + clientRequestId + timestamp(ms) + corpoDaRequisicaoSerializado
 * messageSignature = Base64( HMAC-SHA256(apiSecret, rawSignature) )
 * <p>
 * Headers enviados em toda chamada: Api-Key, Client-Request-Id, Timestamp, Message-Signature.
 */
@ApplicationScoped
public class FiservSignatureService {

    @Inject
    FiservProperties properties;

    public FiservAuthHeaders headersFor(String jsonBody) {
        return headersFor(jsonBody, properties.apiKey(), properties.apiSecret());
    }

    public FiservAuthHeaders headersFor(String jsonBody, String apiKey, String apiSecret) {
        String clientRequestId = UUID.randomUUID().toString();
        long timestamp = System.currentTimeMillis();
        String body = jsonBody == null ? "" : jsonBody;
        String rawSignature = apiKey + clientRequestId + timestamp + body;
        String signature = sign(rawSignature, apiSecret);
        return new FiservAuthHeaders(apiKey, clientRequestId, String.valueOf(timestamp), signature);
    }

    private String sign(String message, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception exception) {
            throw new IllegalStateException("Falha ao gerar Message-Signature Fiserv", exception);
        }
    }

    public record FiservAuthHeaders(String apiKey, String clientRequestId, String timestamp, String messageSignature) {
    }
}
