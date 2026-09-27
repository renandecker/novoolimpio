package br.com.sol7.olimpio.notificacoes.notificacao.consumer;

import br.com.sol7.olimpio.notificacoes.notificacao.dto.NotificacaoEvento;
import br.com.sol7.olimpio.notificacoes.notificacao.service.NotificacaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Porta de entrada generica via RabbitMQ.
 * Os demais microservicos publicam {@link NotificacaoEvento} no exchange
 * {@code olimpio.notificacao.generic}; aqui o fluxo retorna a chamada generica
 * (NotificacaoService.create), que decide os canais conforme configuracao do
 * sistema + preferencias do usuario e so entao faz o dispatch por canal.
 */
@ApplicationScoped
public class NotificacaoGenericConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificacaoGenericConsumer.class);

    @Inject
    ObjectMapper objectMapper;

    @Inject
    NotificacaoService notificacaoService;

    @Incoming("notificacao-generic-in")
    public Uni<Void> onEvento(String payload) {
        NotificacaoEvento evento;
        try {
            evento = objectMapper.readValue(payload, NotificacaoEvento.class);
        } catch (Exception e) {
            LOGGER.warn("Payload de notificacao generica invalido: {}", e.getMessage());
            return Uni.createFrom().voidItem();
        }
        if (evento.titulo() == null || evento.titulo().isBlank()) {
            LOGGER.warn("Evento de notificacao sem titulo ignorado (username={})", evento.username());
            return Uni.createFrom().voidItem();
        }
        return notificacaoService.create(evento.toRequest())
                .onFailure().invoke(err ->
                        LOGGER.warn("Falha ao criar notificacao via evento generico: {}", err.getMessage()))
                .onFailure().recoverWithNull()
                .replaceWithVoid();
    }
}
