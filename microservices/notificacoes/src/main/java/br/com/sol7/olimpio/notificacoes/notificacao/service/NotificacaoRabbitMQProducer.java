package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.Notificacao;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

/**
 * Publica a notificacao no RabbitMQ em um exchange por canal de entrega:
 * <ul>
 * <li>olimpio.notificacao.email  -> consumido para envio via SMTP (CanalEmailService)</li>
 * <li>olimpio.notificacao.mobile -> consumido para push em tempo real no react native</li>
 * <li>olimpio.notificacao.web    -> consumido para push em tempo real no react web</li>
 * </ul>
 * A mensagem vai apenas para os exchanges dos canais habilitados na notificacao.
 */
@ApplicationScoped
public class NotificacaoRabbitMQProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificacaoRabbitMQProducer.class);

    @Inject
    @Channel("notificacao-email-out")
    MutinyEmitter<String> emailOut;

    @Inject
    @Channel("notificacao-mobile-out")
    MutinyEmitter<String> mobileOut;

    @Inject
    @Channel("notificacao-web-out")
    MutinyEmitter<String> webOut;

    @Inject
    @Channel("notificacao-telegram-out")
    MutinyEmitter<String> telegramOut;

    @Inject
    @Channel("notificacao-sms-out")
    MutinyEmitter<String> smsOut;

    @Inject
    @Channel("notificacao-whatsapp-out")
    MutinyEmitter<String> whatsappOut;

    @Inject
    ObjectMapper objectMapper;

    public Uni<Void> dispatch(Notificacao e) {
        return resolveIdUsuario(e.username)
                .onItem().transformToUni(idUsuario -> {
                    String json = toJson(e, idUsuario);
                    return publish(e.canalEmail, emailOut, "EMAIL", json)
                            .chain(() -> publish(e.canalMobile, mobileOut, "MOBILE", json))
                            .chain(() -> publish(e.canalTelegram, telegramOut, "TELEGRAM", json))
                            .chain(() -> publish(e.canalSms, smsOut, "SMS", json))
                            .chain(() -> publish(e.canalWhatsapp, whatsappOut, "WHATSAPP", json))
                            .chain(() -> publish(e.canalSistema, webOut, "WEB", json));
                });
    }

    private Uni<Integer> resolveIdUsuario(String username) {
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(
                        "SELECT id FROM bas_login WHERE username = ?1", Integer.class)
                        .setParameter(1, username)
                        .getSingleResult())
                .onItem().transform(Optional::ofNullable)
                .onItem().ifNull().continueWith(() -> Optional.of(0))
                .onItem().transform(opt -> opt.orElse(0));
    }

    private Uni<Void> publish(boolean habilitado, MutinyEmitter<String> emitter, String canal, String json) {
        if (!habilitado) {
            return Uni.createFrom().voidItem();
        }
        return emitter.send(json)
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao publicar notificação no RabbitMQ (canal {}): {}", canal, err.getMessage()))
                .onFailure().recoverWithNull();
    }

    private String toJson(Notificacao e, Integer idUsuario) {
        try {
            return objectMapper.writeValueAsString(new NotificacaoMessage(
                    e.id, e.username, idUsuario, e.titulo, e.mensagem, e.tipo, e.link,
                    e.canalSistema, e.canalMobile, e.canalEmail, e.canalTelegram, e.canalSms, e.canalWhatsapp, null));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Erro ao serializar a notificação para o RabbitMQ", ex);
        }
    }
}