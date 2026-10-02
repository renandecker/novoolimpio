package br.com.sol7.olimpio.basico.shared.util;

import io.smallrye.mutiny.Uni;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.HttpResponse;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Migrado de br.com.sol7.olimpio.util.CorreioCepAberto (legado) - versao reativa.
 * A API do cepaberto.com exige o token cadastrado em ConfiguracaoEmail.tokenCorreio.
 */
@ApplicationScoped
public class CorreioCepAberto {

    private static final String URL_API = "http://www.cepaberto.com/api/v3/cep?cep=";

    @Inject
    Vertx vertx;

    public Uni<String> getLatLongApi(String cep, String token) {
        return buscarCampo(cep, token, json -> json.getString("latitude") + "," + json.getString("longitude"));
    }

    public Uni<String> getIbge(String cep, String token) {
        return buscarCampo(cep, token, json -> json.getJsonObject("cidade").getString("ibge"));
    }

    private Uni<String> buscarCampo(String cep, String token, java.util.function.Function<JsonObject, String> extractor) {
        if (cep == null || cep.isBlank()) {
            return Uni.createFrom().item("");
        }
        WebClient client = WebClient.create(vertx, new WebClientOptions().setConnectTimeout(120000));
        return Uni.createFrom().completionStage(
                        client.request(HttpMethod.GET, URL_API + normalizarCep(cep))
                                .putHeader("User-Agent", "CepAberto")
                                .putHeader("Accept", "application/json")
                                .putHeader("Authorization", "Token token=" + (token == null ? "" : token))
                                .send()
                                .toCompletionStage()
                                .thenApply(HttpResponse::bodyAsString))
                .onItem().transformToUni(body -> {
                    try {
                        return Uni.createFrom().item(extractor.apply(new JsonObject(body)));
                    } catch (Exception e) {
                        return Uni.createFrom().item("");
                    }
                })
                .onFailure().recoverWithUni(throwable -> Uni.createFrom().item(""));
    }

    private String normalizarCep(String cep) {
        String limpo = cep.replace("-", "").replace(".", "").replace(" ", "").trim();
        if (limpo.length() == 8) {
            return limpo.substring(0, 5) + "-" + limpo.substring(5);
        }
        return limpo;
    }
}