package br.com.sol7.olimpio.basico.shared.util;

import io.smallrye.mutiny.Uni;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Migrado de br.com.sol7.olimpio.api.feriado.HttpFeriado (legado) - versao reativa.
 * API de feriados nacionais/estaduais (https://api.calendario.com.br/).
 */
@ApplicationScoped
public class HttpFeriado {

    private static final String URL_API = "https://api.calendario.com.br/?json=true";

    @Inject
    Vertx vertx;

    public Uni<String> httpGet(String uf, String cidade, String ano, String key) {
        WebClient client = WebClient.create(vertx, new WebClientOptions().setConnectTimeout(120000));
        return Uni.createFrom().completionStage(
                        client.request(HttpMethod.GET, URL_API
                                        + "&ano=" + ano
                                        + "&estado=" + uf
                                        + "&cidade=" + cidade
                                        + "%C3%A9"
                                        + "&token=" + key)
                                .send()
                                .toCompletionStage()
                                .thenApply(response -> response.bodyAsString()))
                .onFailure().recoverWithItem("");
    }
}