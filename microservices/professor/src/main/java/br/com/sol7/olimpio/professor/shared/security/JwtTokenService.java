package br.com.sol7.olimpio.professor.shared.security;

import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@ApplicationScoped
public class JwtTokenService {
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private String secret() {
        String value = System.getenv("JWT_SECRET");
        if (value == null || value.isBlank()) throw new IllegalStateException("JWT_SECRET nao definido");
        return value;
    }

    public Claims verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !MessageDigest.isEqual(DECODER.decode(parts[2]), DECODER.decode(sign(parts[0] + "." + parts[1]))))
                throw new IllegalArgumentException();
            JsonObject payload = new JsonObject(new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8));
            Long exp = payload.getLong("exp");
            String jti = payload.getString("jti");
            if (!"olimpio".equals(payload.getString("iss")) || exp == null || exp <= Instant.now().getEpochSecond() || jti == null)
                throw new IllegalArgumentException();
            Set<String> permissions = payload.getJsonArray("permissions", new JsonArray()).stream().map(Object::toString).collect(java.util.stream.Collectors.toUnmodifiableSet());
            Map<String, Set<String>> modulePermissions = new LinkedHashMap<>();
            JsonObject modules = payload.getJsonObject("modulePermissions", new JsonObject());
            modules.forEach(entry -> modulePermissions.put(entry.getKey(), new LinkedHashSet<>(((JsonArray) entry.getValue()).stream().map(Object::toString).toList())));
            return new Claims(payload.getString("sub"), permissions, UUID.fromString(jti), modulePermissions);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Token inválido ou expirado", exception);
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Falha ao assinar token", exception);
        }
    }

    public record Claims(String subject, Set<String> permissions, UUID jti, Map<String, Set<String>> modulePermissions) {
        public Claims(String subject, Set<String> permissions, Map<String, Set<String>> modulePermissions) {
            this(subject, permissions, null, modulePermissions);
        }
    }
}