package br.com.sol7.olimpio.asaas;

import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.hibernate.reactive.mutiny.Mutiny;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servico que le as credenciais Asaas da tabela fin_bancos (por unidade + provedor).
 * Utiliza cache Caffeine para evitar queries ao banco a cada chamada de API.
 * Faz fallback para as variaveis de ambiente quando nao encontra no DB.
 */
@ApplicationScoped
public class FinBancoConfigService {

    /**
     * Busca todas as configuracoes Asaas para uma unidade.
     * Cacheia por 10 minutos.
     */
    @CacheResult(cacheName = "fin-banco-config-cache")
    public Uni<Map<String, String>> getConfiguracao(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> {
                    String sql = "SELECT chave, valor FROM fin_bancos "
                            + "WHERE id_unidade = :unidadeId AND provedor = 'ASAAS' AND fl_ativo = true";
                    return session.createNativeQuery(sql)
                            .setParameter("unidadeId", unidadeId)
                            .getResultList()
                            .map(list -> {
                                Map<String, String> config = new ConcurrentHashMap<>();
                                for (Object row : list) {
                                    Object[] arr = (Object[]) row;
                                    String chave = String.valueOf(arr[0]);
                                    String valor = arr[1] != null ? String.valueOf(arr[1]) : "";
                                    config.put(chave, valor);
                                }
                                return config;
                            });
                });
    }

    /**
     * Busca o token (api-key) Asaas para uma unidade.
     * Fallback: variavel de ambiente ASAAS_API_KEY.
     */
    @CacheResult(cacheName = "fin-banco-config-cache")
    public Uni<String> getToken(Long unidadeId) {
        if (unidadeId == null) {
            return Uni.createFrom().item(getEnvToken());
        }
        return getConfiguracao(unidadeId).map(config -> {
            String token = config.getOrDefault("api-key", "");
            return token.isEmpty() ? getEnvToken() : token;
        });
    }

    /**
     * Busca a URL base Asaas para uma unidade.
     * Fallback: variavel de ambiente ASAAS_BASE_URL ou padrao sandbox.
     */
    @CacheResult(cacheName = "fin-banco-config-cache")
    public Uni<String> getBaseUrl(Long unidadeId) {
        if (unidadeId == null) {
            return Uni.createFrom().item(getEnvBaseUrl());
        }
        return getConfiguracao(unidadeId).map(config -> {
            String url = config.getOrDefault("base-url", "");
            return url.isEmpty() ? getEnvBaseUrl() : url;
        });
    }

    /**
     * Invalida o cache de configuracao.
     */
    @CacheInvalidateAll(cacheName = "fin-banco-config-cache")
    public void invalidateCache() {
    }

    private String getEnvToken() {
        String key = System.getenv("ASAAS_API_KEY");
        return key != null ? key : "";
    }

    private String getEnvBaseUrl() {
        String url = System.getenv("ASAAS_BASE_URL");
        return url != null ? url : "https://api-sandbox.asaas.com";
    }
}
