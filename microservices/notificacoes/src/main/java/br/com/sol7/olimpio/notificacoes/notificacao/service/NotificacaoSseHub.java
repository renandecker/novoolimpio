package br.com.sol7.olimpio.notificacoes.notificacao.service;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.operators.multi.processors.BroadcastProcessor;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Distribui as notificacoes em tempo real (SSE) para os clientes conectados,
 * separando por canal (WEB/MOBILE) e por usuario. O consumidor do Kafka publica
 * aqui; o endpoint /api/notificacoes/stream/{canal} assina o canal do usuario logado.
 */
@ApplicationScoped
public class NotificacaoSseHub {

    public static final String CANAL_WEB = "WEB";
    public static final String CANAL_MOBILE = "MOBILE";

    private final ConcurrentMap<String, BroadcastProcessor<String>> processadores = new ConcurrentHashMap<>();

    public Multi<String> subscribe(String canal, String username) {
        return processadores.computeIfAbsent(chave(canal, username), k -> BroadcastProcessor.create());
    }

    public void publish(String canal, String username, String payload) {
        BroadcastProcessor<String> processador = processadores.get(chave(canal, username));
        if (processador != null) {
            processador.onNext(payload);
        }
    }

    private String chave(String canal, String username) {
        String c = canal == null ? "" : canal.toUpperCase().trim();
        String u = username == null ? "" : username.toLowerCase().trim();
        return c + ":" + u;
    }
}
