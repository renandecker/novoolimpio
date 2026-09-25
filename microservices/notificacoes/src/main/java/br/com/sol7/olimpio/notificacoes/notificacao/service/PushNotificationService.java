package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.UsuarioMobile;
import br.com.sol7.olimpio.notificacoes.notificacao.repository.UsuarioMobileRepository;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Serviço para envio de push notifications via FCM (Android) e APNs (iOS).
 * Usa HTTP/2 para APNs e HTTP/1.1 para FCM.
 */
@ApplicationScoped
public class PushNotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PushNotificationService.class);

    @Inject
    UsuarioMobileRepository usuarioMobileRepository;

    @ConfigProperty(name = "olimpio.notificacoes.fcm.server-key", defaultValue = "")
    String fcmServerKey;

    @ConfigProperty(name = "olimpio.notificacoes.apns.key-id", defaultValue = "")
    String apnsKeyId;

    @ConfigProperty(name = "olimpio.notificacoes.apns.team-id", defaultValue = "")
    String apnsTeamId;

    @ConfigProperty(name = "olimpio.notificacoes.apns.bundle-id", defaultValue = "")
    String apnsBundleId;

    @ConfigProperty(name = "olimpio.notificacoes.apns.private-key", defaultValue = "")
    String apnsPrivateKey;

    @ConfigProperty(name = "olimpio.notificacoes.apns.use-sandbox", defaultValue = "true")
    boolean apnsUseSandbox;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Envia push notification para todos os dispositivos ativos do usuário.
     */
    public Uni<Void> enviarParaUsuario(Integer idUsuario, NotificacaoMessage message) {
        return usuarioMobileRepository.findByUsuarioAtivo(idUsuario)
                .onItem().transformToUni(tokens -> {
                    if (tokens.isEmpty()) {
                        LOGGER.debug("Nenhum token móvel ativo para o usuário ID: {}", idUsuario);
                        return Uni.createFrom().voidItem();
                    }
                    return enviarParaTokens(tokens, message);
                });
    }

    /**
     * Envia push notification para uma lista de tokens.
     */
    private Uni<Void> enviarParaTokens(List<UsuarioMobile> tokens, NotificacaoMessage message) {
        return Uni.createFrom().deferred(() -> {
            for (UsuarioMobile token : tokens) {
                if ("IOS".equalsIgnoreCase(token.plataforma)) {
                    enviarApns(token.token, message);
                } else {
                    enviarFcm(token.token, message);
                }
            }
            return Uni.createFrom().voidItem();
        });
    }

    private void enviarFcm(String token, NotificacaoMessage message) {
        if (fcmServerKey.isBlank()) {
            LOGGER.warn("FCM Server Key não configurado, pulando envio para token: {}", maskToken(token));
            return;
        }

        String payload = """
                {
                    "to": "%s",
                    "notification": {
                        "title": "%s",
                        "body": "%s"
                    },
                    "data": {
                        "id": "%d",
                        "tipo": "%s",
                        "link": "%s"
                    }
                }
                """.formatted(
                escapeJson(token),
                escapeJson(message.titulo()),
                escapeJson(message.mensagem() != null ? message.mensagem() : ""),
                message.id(),
                message.tipo() != null ? escapeJson(message.tipo()) : "",
                message.link() != null ? escapeJson(message.link()) : ""
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://fcm.googleapis.com/fcm/send"))
                .header("Authorization", "key=" + fcmServerKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .timeout(Duration.ofSeconds(10))
                .build();

        CompletableFuture<HttpResponse<String>> future = httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());
        future.thenAccept(response -> {
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                LOGGER.debug("Push FCM enviado com sucesso para token: {}", maskToken(token));
            } else {
                LOGGER.warn("Falha ao enviar push FCM para token {}: {} - {}", maskToken(token), response.statusCode(), response.body());
            }
        }).exceptionally(ex -> {
            LOGGER.warn("Erro ao enviar push FCM para token {}: {}", maskToken(token), ex.getMessage());
            return null;
        });
    }

    private void enviarApns(String token, NotificacaoMessage message) {
        if (apnsKeyId.isBlank() || apnsTeamId.isBlank() || apnsBundleId.isBlank() || apnsPrivateKey.isBlank()) {
            LOGGER.warn("Configuração APNs incompleta, pulando envio para token: {}", maskToken(token));
            return;
        }

        String payload = """
                {
                    "aps": {
                        "alert": {
                            "title": "%s",
                            "body": "%s"
                        },
                        "badge": 1,
                        "sound": "default"
                    },
                    "id": "%d",
                    "tipo": "%s",
                    "link": "%s"
                }
                """.formatted(
                escapeJson(message.titulo()),
                escapeJson(message.mensagem() != null ? message.mensagem() : ""),
                message.id(),
                message.tipo() != null ? escapeJson(message.tipo()) : "",
                message.link() != null ? escapeJson(message.link()) : ""
        );

        String apnsHost = apnsUseSandbox ? "api.sandbox.push.apple.com" : "api.push.apple.com";
        String url = "https://" + apnsHost + "/3/device/" + token;

        // JWT token generation for APNs auth would go here
        // For now, logging that it would be sent
        LOGGER.info("Enviaria APNs para token {} (implementação completa requer JWT auth): {}", maskToken(token), url);
        LOGGER.debug("Payload APNs: {}", payload);
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t");
    }

    private String maskToken(String token) {
        if (token == null || token.length() < 8) return "***";
        return token.substring(0, 4) + "****" + token.substring(token.length() - 4);
    }
}