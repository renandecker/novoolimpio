package br.com.sol7.olimpio.notificacoes.notificacao.consumer;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.notificacoes.notificacao.service.CanalEmailService;
import br.com.sol7.olimpio.notificacoes.notificacao.service.NotificacaoSseHub;
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
 * <li>olimpio.notificacao.mobile -> push em tempo real (SSE) ao react native e marca mobile_enviado</li>
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
    NotificacaoSseHub sseHub;

    @Incoming("notificacao-email-in")
    public Uni<Void> onEmail(String payload) {
        return parse(payload)
                .chain(msg -> canalEmailService.enviar(msg))
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal EMAIL: {}", err.getMessage()));
    }

    @Incoming("notificacao-mobile-in")
    public Uni<Void> onMobile(String payload) {
        return parse(payload)
                .invoke(msg -> sseHub.publish(NotificacaoSseHub.CANAL_MOBILE, msg.username(), payload))
                .chain(msg -> marcaEnviado("mobile_enviado", msg.id()))
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao processar notificação no canal MOBILE: {}", err.getMessage()));
    }

    @Incoming("notificacao-web-in")
    public Uni<Void> onWeb(String payload) {
        return parse(payload)
                .invoke(msg -> sseHub.publish(NotificacaoSseHub.CANAL_WEB, msg.username(), payload))
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
