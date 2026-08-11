package br.com.sol7.olimpio.shared.security;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Set;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@ApplicationScoped
public class JwtTokenService {
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private String secret() { return System.getenv().getOrDefault("JWT_SECRET", "troque-esta-chave-em-producao-olimpio"); }
    public Claims verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !MessageDigest.isEqual(DECODER.decode(parts[2]), DECODER.decode(sign(parts[0] + "." + parts[1])))) throw new IllegalArgumentException();
            JsonObject payload = new JsonObject(new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8));
            Long exp = payload.getLong("exp");
            if (!"olimpio".equals(payload.getString("iss")) || exp == null || exp <= Instant.now().getEpochSecond()) throw new IllegalArgumentException();
            Set<String> permissions = payload.getJsonArray("permissions", new JsonArray()).stream().map(Object::toString).collect(java.util.stream.Collectors.toUnmodifiableSet());
            return new Claims(payload.getString("sub"), permissions);
        } catch (Exception exception) { throw new IllegalArgumentException("Token inválido ou expirado", exception); }
    }
    private String encode(String value) { return ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8)); }
    private String sign(String value) {
        try { Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256")); return ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception exception) { throw new IllegalStateException("Falha ao assinar token", exception); }
    }
    public record Claims(String subject, Set<String> permissions) {}
}
