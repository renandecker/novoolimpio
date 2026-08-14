package br.com.sol7.olimpio.notificacoes.notificacao.service;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoMessage;
import br.com.sol7.olimpio.notificacoes.notificacao.entity.Notificacao;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Publica a notificacao no Kafka em um topico por canal de entrega:
 * <ul>
 *   <li>olimpio.notificacao.email  -> consumido para envio via SMTP (CanalEmailService)</li>
 *   <li>olimpio.notificacao.mobile -> consumido para push em tempo real no react native</li>
 *   <li>olimpio.notificacao.web    -> consumido para push em tempo real no react web</li>
 * </ul>
 * A mensagem vai apenas para os topicos dos canais habilitados na notificacao.
 */
@ApplicationScoped
public class NotificacaoKafkaProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificacaoKafkaProducer.class);

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
    ObjectMapper objectMapper;

    public Uni<Void> dispatch(Notificacao e) {
        String json = toJson(e);
        return publish(e.canalEmail, emailOut, "EMAIL", json)
                .chain(() -> publish(e.canalMobile, mobileOut, "MOBILE", json))
                .chain(() -> publish(e.canalSistema, webOut, "WEB", json));
    }

    private Uni<Void> publish(boolean habilitado, MutinyEmitter<String> emitter, String canal, String json) {
        if (!habilitado) {
            return Uni.createFrom().voidItem();
        }
        return emitter.send(json)
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao publicar notificação no Kafka (canal {}): {}", canal, err.getMessage()))
                .onFailure().recoverWithNull();
    }

    private String toJson(Notificacao e) {
        try {
            return objectMapper.writeValueAsString(new NotificacaoMessage(
                    e.id, e.username, e.titulo, e.mensagem, e.tipo, e.link,
                    e.canalSistema, e.canalMobile, e.canalEmail));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Erro ao serializar a notificação para o Kafka", ex);
        }
    }
}
