package br.com.sol7.olimpio.basico.shared.notificacao;

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
 *
 * <p>Publica {@link NotificacaoEvento} no exchange
 * {@code olimpio.notificacao.generic}. O consumer do notificacoes-service
 * aplica as regras antes do dispatch:
 * <ul>
 * <li>configuracoes de canais do sistema (not_config_canal + defaults); se
 * nenhum canal restar habilitado, nada e enviado;</li>
 * <li>preferencias do usuario (not_preferencia_notificacao_usuario por
 * categoria/tipo/canal);</li>
 * <li>override explicito por chamada (Boolean nao-nulo tem prioridade).</li>
 * </ul>
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
                null, null, null, null, null, null));
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
