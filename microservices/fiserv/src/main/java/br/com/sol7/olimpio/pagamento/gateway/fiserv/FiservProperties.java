package br.com.sol7.olimpio.pagamento.gateway.fiserv;

import io.smallrye.config.ConfigMapping;
import java.util.Optional;

/**
 * Credenciais e parametros da Fiserv Commerce Hub / Payments Gateway (IPP).
 * Ver: https://developer.fiserv.com/product/CommerceHub (Api-Key / Api-Secret do Developer Studio).
 */
@ConfigMapping(prefix = "fiserv")
public interface FiservProperties {

    String baseUrl();

    String apiKey();

    String apiSecret();

    Optional<String> storeId();

    String currency();

    int timeoutMs();
}
