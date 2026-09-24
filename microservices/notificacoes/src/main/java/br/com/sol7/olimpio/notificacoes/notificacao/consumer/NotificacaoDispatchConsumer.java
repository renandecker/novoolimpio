package br.com.sol7.olimpio.notificacoes.notificacao.consumer;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.notificacoes.notificacao.service.CanalEmailService;
import br.com.sol7.olimpio.notificacoes.notificacao.service.CanalTelegramService;
import br.com.sol7.olimpio.notificacoes.notificacao.service.CanalSmsService;
import br.com.sol7.olimpio.notificacoes.notificacao.service.CanalWhatsappService;
import br.com.sol7.olimpio.notificacoes.notificacao.service.NotificacaoSseHub;
import br.com.sol7.olimpio.notificacoes.notificacao.service.PushNotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Consome os topicos do fluxo Kafka de envio de notificacoes e executa a entrega
 * de cada canal:
 * <ul>
 * <li>olimpio.notificacao.email  -> envia o e-mail (SMTP) e marca email_enviado</li>
 * <li>olimpio.notificacao.mobile -> push notification (FCM/APNs) + SSE ao react native e marca mobile_enviado</li>
 * <li>olimpio.notificacao.web    -> push em tempo real (SSE) ao react web</li>
 * </ul>
 */
@ApplicationScoped
public class NotificacaoDispatchConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificacaoDispatchConsumer.class);

    @Inject
    ObjectMapper objectMapper;

    @Inject
    CanalEmailService canalEmailService;

    @Inject
    CanalTelegramService canalTelegramService;

    @Inject
    CanalSmsService canalSmsService;

    @Inject
    CanalWhatsappService canalWhatsappService;

    @Inject
    NotificacaoSseHub sseHub;

    @Inject
    PushNotificationService pushNotificationService;

    @Incoming("notificacao-email-in")
    public Uni<Void> onEmail(String payload) {
        return parse(payload)
                .chain(msg -> canalEmailService.enviar(msg, msg.destinatario()))
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal EMAIL: {}", err.getMessage()));
    }

    @Incoming("notificacao-telegram-in")
    public Uni<Void> onTelegram(String payload) {
        return parse(payload)
                .chain(msg -> canalTelegramService.enviar(msg))
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal TELEGRAM: {}", err.getMessage()));
    }

    @Incoming("notificacao-sms-in")
    public Uni<Void> onSms(String payload) {
        return parse(payload)
                .chain(msg -> canalSmsService.enviar(msg))
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal SMS: {}", err.getMessage()));
    }

    @Incoming("notificacao-whatsapp-in")
    public Uni<Void> onWhatsapp(String payload) {
        return parse(payload)
                .chain(msg -> canalWhatsappService.enviar(msg))
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal WHATSAPP: {}", err.getMessage()));
    }

    @Incoming("notificacao-mobile-in")
    public Uni<Void> onMobile(String payload) {
        return parse(payload)
                .chain(msg -> {
                    if (msg.username() == null || msg.username().isBlank()) {
                        LOGGER.info("Notificação sem username (fluxo de lote por e-mail direto) - push MOBILE ignorado.");
                        return Uni.createFrom().voidItem();
                    }
                    Integer idUsuario = msg.idUsuario();
                    if (idUsuario == null || idUsuario == 0) {
                        LOGGER.warn("Notificação sem idUsuario - push MOBILE ignorado para username: {}", msg.username());
                        return Uni.createFrom().voidItem();
                    }
                    // Envia push notification via FCM/APNs para todos os tokens do usuário
                    return pushNotificationService.enviarParaUsuario(idUsuario, msg)
                            .chain(() -> Uni.createFrom().voidItem()
                                    .invoke(() -> sseHub.publish(NotificacaoSseHub.CANAL_MOBILE, msg.username(), payload))
                                    .chain(() -> marcaEnviado("mobile_enviado", msg.id())));
                })
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal MOBILE: {}", err.getMessage()));
    }

    @Incoming("notificacao-web-in")
    public Uni<Void> onWeb(String payload) {
        return parse(payload)
                .chain(msg -> {
                    if (msg.username() == null || msg.username().isBlank()) {
                        LOGGER.info("Notificação sem username (fluxo de lote por e-mail direto) - push WEB ignorado.");
                        return Uni.createFrom().voidItem();
                    }
                    return Uni.createFrom().voidItem()
                            .invoke(() -> sseHub.publish(NotificacaoSseHub.CANAL_WEB, msg.username(), payload));
                })
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal WEB: {}", err.getMessage()))
                .replaceWithVoid();
    }

    private Uni<NotificacaoMessage> parse(String payload) {
        try {
            return Uni.createFrom().item(objectMapper.readValue(payload, NotificacaoMessage.class));
        } catch (JsonProcessingException e) {
            return Uni.createFrom().failure(new IllegalArgumentException("Payload de notificação inválido", e));
        }
    }

    private Uni<Void> marcaEnviado(String coluna, Long id) {
        if (id == null) {
            return Uni.createFrom().voidItem();
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "UPDATE not_notificacao SET " + coluna + " = true WHERE id = ?1 AND " + coluna + " = false")
                        .setParameter(1, id)
                        .executeUpdate())
                .replaceWithVoid();
    }
}
