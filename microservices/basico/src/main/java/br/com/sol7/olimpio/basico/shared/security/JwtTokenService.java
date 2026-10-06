package br.com.sol7.olimpio.basico.shared.security;

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
    private static final long TTL_SECONDS = 60 * 60 * 8;

    private String secret() {
        String value = System.getenv("JWT_SECRET");
        if (value == null || value.isBlank()) throw new IllegalStateException("JWT_SECRET nao definido");
        return value;
    }

    public IssuedToken issue(String subject, Set<String> permissions) {
        return issue(subject, permissions, null);
    }

    public IssuedToken issue(String subject, Set<String> permissions, Map<String, Set<String>> modulePermissions) {
        long expiresAt = Instant.now().getEpochSecond() + TTL_SECONDS;
        String jti = UUID.randomUUID().toString();
        String header = encode(new JsonObject().put("alg", "HS256").put("typ", "JWT").encode());
        JsonObject payload = new JsonObject().put("sub", subject).put("iss", "olimpio").put("jti", jti).put("exp", expiresAt).put("permissions", new JsonArray(permissions.stream().toList()));
        if (modulePermissions != null && !modulePermissions.isEmpty()) {
            JsonObject modules = new JsonObject();
            modulePermissions.forEach((key, value) -> modules.put(key, new JsonArray(value.stream().toList())));
            payload.put("modulePermissions", modules);
        }
        String body = header + "." + encode(payload.encode());
        return new IssuedToken(body + "." + sign(body), expiresAt, jti);
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

    private String encode(String value) {
        return ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
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

    public record IssuedToken(String token, long expiresAt, String jti) {
        public IssuedToken(String token, long expiresAt){
            this(token, expiresAt, null);
        }
    }

    public record Claims(String subject, Set<String> permissions, UUID jti, Map<String, Set<String>> modulePermissions) {
        public Claims(String subject, Set < String > permissions, Map < String, Set < String >> modulePermissions) {
            this(subject, permissions, null, modulePermissions);
        }
    }
}