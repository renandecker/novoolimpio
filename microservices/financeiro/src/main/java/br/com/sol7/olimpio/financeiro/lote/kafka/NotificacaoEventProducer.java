package br.com.sol7.olimpio.financeiro.lote.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.smallrye.mutiny.Uni;
import io.smallrye.reactive.messaging.MutinyEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;

/**
 * Publica as cobranças de lote nos tópicos do notificacoes-service
 * ({@code olimpio.notificacao.email}, {@code olimpio.notificacao.mobile} e
 * {@code olimpio.notificacao.web}), conforme os canais solicitados: e-mail entrega
 * no endereço do contrato, push mobile/web no username (quando houver login).
 */
@ApplicationScoped
public class NotificacaoEventProducer {

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

    public Uni<Void> publicar(NotificacaoMessage msg) {
        String json;
        try {
            json = objectMapper.writeValueAsString(msg);
        } catch (Exception e) {
            Log.errorf(e, "NotificacaoEventProducer - falha ao serializar notificacao de lote");
            return Uni.createFrom().voidItem();
        }
        return enviar(msg.canalEmail(), emailOut, "EMAIL", json)
                .chain(() -> enviar(msg.canalMobile(), mobileOut, "MOBILE", json))
                .chain(() -> enviar(msg.canalSistema(), webOut, "WEB", json));
    }

    private Uni<Void> enviar(boolean habilitado, MutinyEmitter<String> emitter, String canal, String json) {
        if (!habilitado) {
            return Uni.createFrom().voidItem();
        }
        return emitter.send(json)
                .onFailure().invoke(err ->
                        Log.warnf("NotificacaoEventProducer - falha ao publicar lote no topico %s: %s", canal, err.getMessage()))
                .onFailure().recoverWithNull();
    }
}
