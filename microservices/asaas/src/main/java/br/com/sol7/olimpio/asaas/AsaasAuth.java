package br.com.sol7.olimpio.asaas;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Fornece o access_token (API key) do Asaas para os REST clients gerados
 * (br.com.sol7.olimpio.asaas.*.*AsaasClient), via @ClientHeaderParam.
 * <p>
 * Suporta configuracao por unidade via tabela fin_bancos. Se unidadeId for fornecido,
 * busca a chave no DB (com cache). Caso contrario, usa a variavel de ambiente.
 * <p>
 * A versao estatica token() mantem compatibilidade com @ClientHeaderParam existente.
 */
@ApplicationScoped
public class AsaasAuth {

    @Inject
    FinBancoConfigService finBancoConfig;

    /**
     * Metodo estatico para compatibilidade com @ClientHeaderParam nos clients.
     * Usa variavel de ambiente como fallback.
     */
    public static String token() {
        String key = System.getenv("ASAAS_API_KEY");
        return key != null ? key : "";
    }

    /**
     * Busca o token Asaas para uma unidade especifica.
     * Se unidadeId for null, usa variavel de ambiente.
     */
    public String token(Long unidadeId) {
        if (unidadeId == null) {
            return token();
        }
        try {
            return io.smallrye.mutiny.Uni.createFrom().item(token())
                    .onItem().transformToUni(envToken ->
                            finBancoConfig.getToken(unidadeId).map(dbToken ->
                                    dbToken.isEmpty() ? envToken : dbToken))
                    .await().indefinitely();
        } catch (Exception e) {
            return token();
        }
    }

    /**
     * Busca a URL base Asaas para uma unidade especifica.
     */
    public String baseUrl(Long unidadeId) {
        if (unidadeId == null) {
            return getEnvBaseUrl();
        }
        try {
            return io.smallrye.mutiny.Uni.createFrom().item(getEnvBaseUrl())
                    .onItem().transformToUni(envUrl ->
                            finBancoConfig.getBaseUrl(unidadeId).map(dbUrl ->
                                    dbUrl.isEmpty() ? envUrl : dbUrl))
                    .await().indefinitely();
        } catch (Exception e) {
            return getEnvBaseUrl();
        }
    }

    private String getEnvBaseUrl() {
        String url = System.getenv("ASAAS_BASE_URL");
        return url != null ? url : "https://api-sandbox.asaas.com";
    }
}
