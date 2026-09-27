package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
public class CanalTelegramService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CanalTelegramService.class);

    @Inject
    @RestClient
    TelegramApiClient telegramApiClient;

    @ConfigProperty(name = "olimpio.notificacoes.telegram.bot-token", defaultValue = "")
    Optional<String> botTokenConfig;

    @ConfigProperty(name = "olimpio.notificacoes.telegram.chat-id", defaultValue = "")
    Optional<String> chatIdConfig;

    public Uni<Void> enviar(NotificacaoMessage msg) {
        if (msg == null) {
            return Uni.createFrom().voidItem();
        }
        return resolveConfigTelegram()
                .chain(config -> {
                    String token = config.token;
                    String defaultChatId = config.chatId;

                    if (token == null || token.isBlank()) {
                        LOGGER.warn("Token do Telegram não configurado. Notificação '{}' não enviada por Telegram.", msg.titulo());
                        return Uni.createFrom().voidItem();
                    }

                    return resolveChatId(msg.username(), defaultChatId)
                            .chain(chatId -> {
                                if (chatId == null || chatId.isBlank()) {
                                    LOGGER.warn("Chat ID do Telegram não encontrado para o usuário '{}'. Notificação não enviada.", msg.username());
                                    return Uni.createFrom().voidItem();
                                }

                                String text = formatMessage(msg);
                                return telegramApiClient.sendMessage(token, chatId, text, "Markdown")
                                        .onItem().transformToUni(resp -> {
                                            if (resp.getStatus() >= 200 && resp.getStatus() < 300) {
                                                return Uni.createFrom().voidItem();
                                            } else {
                                                LOGGER.warn("Erro na API do Telegram (status {})", resp.getStatus());
                                                return Uni.createFrom().failure(new RuntimeException("Telegram API error: " + resp.getStatus()));
                                            }
                                        })
                                        .onFailure().invoke(err ->
                                                LOGGER.warn("Falha ao enviar mensagem Telegram para '{}': {}", chatId, err.getMessage()))
                                        .replaceWithVoid()
                                        .chain(() -> marcaTelegramEnviado(msg.id()));
                            });
                });
    }

    private record TelegramConfig(String token, String chatId) {}

    private Uni<TelegramConfig> resolveConfigTelegram() {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "SELECT destinatario, descricao FROM not_config_canal WHERE canal = 'TELEGRAM' LIMIT 1", Tuple.class)
                        .getResultList())
                .map(list -> {
                    String token = botTokenConfig.orElse("");
                    String chatId = chatIdConfig.orElse("");
                    if (!list.isEmpty() && list.get(0) != null) {
                        Tuple row = (Tuple) list.get(0);
                        String dest = TupleHelper.getString(row, "destinatario");
                        String desc = TupleHelper.getString(row, "descricao");
                        if (dest != null && !dest.isBlank()) {
                            chatId = dest;
                        }
                        if (desc != null && !desc.isBlank() && (token == null || token.isBlank())) {
                            token = desc;
                        }
                    }
                    return new TelegramConfig(token, chatId);
                });
    }

    private Uni<String> resolveChatId(String username, String defaultChatId) {
        if (username == null || username.isBlank()) {
            return Uni.createFrom().item(defaultChatId);
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery("""
                        SELECT p.telefone AS telefone
                        FROM bas_login l
                        LEFT JOIN bas_usuario u ON u.id = l.id_usuario
                        LEFT JOIN bas_pessoa p ON p.id = u.id_pessoa
                        WHERE lower(l.username) = lower(?1)
                        LIMIT 1
                        """, Tuple.class)
                        .setParameter(1, username)
                        .getResultList())
                .map(list -> {
                    if (!list.isEmpty() && list.get(0) != null) {
                        String tel = TupleHelper.getString(list.get(0), "telefone");
                        if (tel != null && !tel.isBlank()) {
                            return tel.trim();
                        }
                    }
                    return defaultChatId;
                });
    }

    private Uni<Void> marcaTelegramEnviado(Long id) {
        if (id == null) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "UPDATE not_notificacao SET telegram_enviado = true WHERE id = ?1 AND telegram_enviado = false")
                        .setParameter(1, id)
                        .executeUpdate())
                .replaceWithVoid();
    }

    private String formatMessage(NotificacaoMessage msg) {
        StringBuilder sb = new StringBuilder();
        sb.append("🔔 *").append(escapeMarkdown(msg.titulo())).append("*\n\n");
        if (msg.mensagem() != null && !msg.mensagem().isBlank()) {
            sb.append(escapeMarkdown(msg.mensagem())).append("\n\n");
        }
        if (msg.link() != null && !msg.link().isBlank()) {
            sb.append("🔗 [Acessar Link](").append(msg.link()).append(")\n");
        }
        sb.append("\n_Equipe Olímpio_");
        return sb.toString();
    }

    private String escapeMarkdown(String text) {
        if (text == null) return "";
        return text.replace("_", "\\_").replace("*", "\\*").replace("[", "\\[").replace("`", "\\`");
    }

    @org.eclipse.microprofile.rest.client.inject.RegisterRestClient(baseUri = "https://api.telegram.org")
    @Path("/bot{token}")
    public interface TelegramApiClient {
        @POST
        @Path("/sendMessage")
        @Consumes(MediaType.APPLICATION_JSON)
        @Produces(MediaType.APPLICATION_JSON)
        Uni<Response> sendMessage(
                @PathParam("token") String token,
                @QueryParam("chat_id") String chatId,
                @QueryParam("text") String text,
                @QueryParam("parse_mode") String parseMode
        );
    }
}
