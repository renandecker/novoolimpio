package br.com.sol7.olimpio.aluno.shared.notificacao;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Metodo generico que envia notificacoes pelo RabbitMQ retornando ao
 * microservico de notificacoes na chamada generica.
 * Falhas de publicacao nunca quebram o fluxo principal (recoverWithNull).
 */
@ApplicationScoped
public class NotificacaoEventProducer {

    @Inject
    @Channel("notificacao-generic-out")
    MutinyEmitter<String> genericOut;

    @Inject
    ObjectMapper objectMapper;

    public Uni<Void> enviar(String username, String categoria, String tipo,
                            String titulo, String mensagem, String link) {
        return enviar(new NotificacaoEvento(username, categoria, tipo, titulo, mensagem, link,
                null, null, null, null, null));
    }

    public Uni<Void> enviar(NotificacaoEvento evento) {
        if (evento == null || evento.titulo() == null || evento.titulo().isBlank()) {
            return Uni.createFrom().voidItem();
        }
        String json;
        try {
            json = objectMapper.writeValueAsString(evento);
        } catch (Exception e) {
            Log.errorf(e, "NotificacaoEventProducer - falha ao serializar evento generico");
            return Uni.createFrom().voidItem();
        }
        return genericOut.send(json)
                .onFailure().invoke(err ->
                        Log.warnf("NotificacaoEventProducer - falha ao publicar evento generico: %s", err.getMessage()))
                .onFailure().recoverWithNull();
    }
}
