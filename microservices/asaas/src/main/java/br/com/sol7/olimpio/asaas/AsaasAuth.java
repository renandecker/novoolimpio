package br.com.sol7.olimpio.asaas;

/**
 * Fornece o access_token (API key) do Asaas para os REST clients gerados
 * (br.com.sol7.olimpio.asaas.*.*AsaasClient), via @ClientHeaderParam.
 * <p>
 * A chave real fica só aqui no servidor (variável de ambiente ASAAS_API_KEY) - quem chama os
 * endpoints do asaas nunca precisa conhecer nem enviar a chave do Asaas.
 */
public final class AsaasAuth {

    private AsaasAuth() {
    }

    public static String token() {
        String key = System.getenv("ASAAS_API_KEY");
        return key != null ? key : "";
    }
}
