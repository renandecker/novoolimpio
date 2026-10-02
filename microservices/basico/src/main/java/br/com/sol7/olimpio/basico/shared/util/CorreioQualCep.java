package br.com.sol7.olimpio.basico.shared.util;

import io.smallrye.mutiny.Uni;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import io.vertx.ext.web.client.HttpResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class CorreioQualCep {

    @Inject
    Vertx vertx;

    private WebClient createClient() {
        return WebClient.create(vertx, new WebClientOptions()
                .setConnectTimeout(120000)
                .setIdleTimeout(120)
                .setIdleTimeoutUnit(TimeUnit.SECONDS));
    }

    public Uni<String> getLatLong(String cep) {
        return executeRequest(cep, this::parseLatLong);
    }

    private String parseLatLong(String html) {
        try {
            Document doc = Jsoup.parse(html);
            Elements colunas = doc.getElementsByClass("col-sm-5");
            if (colunas.size() < 2) {
                return "";
            }
            String texto = colunas.get(1).text();
            int indice = texto.indexOf("Latitude");
            if (indice < 0) {
                return "";
            }
            return texto.substring(indice)
                    .replace("Latitude:", "")
                    .replace("Longitude:", "")
                    .replace("/", ",")
                    .replace(" ", "")
                    .trim();
        } catch (Exception e) {
        }
        return "";
    }

    public Uni<String> getEndereco(String cep) {
        return executeRequest(cep, this::parseEndereco);
    }

    public Uni<String> getBairro(String cep) {
        return executeRequest(cep, this::parseBairro);
    }

    public Uni<String> getCidade(String cep) {
        return executeRequest(cep, this::parseCidade);
    }

    public Uni<String> getUF(String cep) {
        return executeRequest(cep, this::parseUF);
    }

    private Uni<String> executeRequest(String cep, java.util.function.Function<String, String> parser) {
        WebClient client = createClient();
        return Uni.createFrom().completionStage(
                client.request(HttpMethod.GET, "http://www.qualocep.com/busca-cep/" + cep)
                        .send()
                        .toCompletionStage()
                        .thenApply(response -> parser.apply(response.bodyAsString()))
                        .exceptionally(throwable -> "")
        );
    }

    private String parseEndereco(String html) {
        try {
            Document doc = Jsoup.parse(html);
            Elements elements = doc.select("span[itemprop=streetAddress]");
            for (Element el : elements) {
                return el.text().trim();
            }
        } catch (Exception e) {
        }
        return "";
    }

    private String parseBairro(String html) {
        try {
            Document doc = Jsoup.parse(html);
            Elements elements = doc.select("td:gt(1)");
            for (Element el : elements) {
                return el.text().trim();
            }
        } catch (Exception e) {
        }
        return "";
    }

    private String parseCidade(String html) {
        try {
            Document doc = Jsoup.parse(html);
            Elements elements = doc.select("span[itemprop=addressLocality]");
            for (Element el : elements) {
                return el.text().trim();
            }
        } catch (Exception e) {
        }
        return "";
    }

    private String parseUF(String html) {
        try {
            Document doc = Jsoup.parse(html);
            Elements elements = doc.select("span[itemprop=addressRegion]");
            for (Element el : elements) {
                return el.text().trim();
            }
        } catch (Exception e) {
        }
        return "";
    }
}