package br.com.sol7.olimpio.pagamento.gateway.fiserv;

import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.ExpiryDate;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.PaymentCard;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.SaleRequest;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.ScheduleRequest;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.SecondaryTransactionRequest;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.TokenizationRequest;
import br.com.sol7.olimpio.pagamento.gateway.fiserv.dto.TransactionAmount;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Ponto unico de integracao com a Fiserv Commerce Hub / Payments Gateway (IPP).
 * <p>
 * Suporta configuracao por unidade via tabela fin_bancos. Se unidadeId for fornecido,
 * busca as credenciais no DB (com cache). Caso contrario, usa as properties estaticas.
 */
@ApplicationScoped
public class FiservGatewayService {

    @Inject
    @RestClient
    FiservPaymentClient client;

    @Inject
    FiservSignatureService signer;

    @Inject
    FiservProperties properties;

    @Inject
    FinBancoConfigService finBancoConfig;

    @Inject
    ObjectMapper mapper;

    // --------------- Metodos com unidadeId (config por unidade) ---------------

    public Uni<JsonNode> tokenizarCartao(Long unidadeId, String numero, String cvv, String mes, String ano) {
        var request = TokenizationRequest.of(new PaymentCard(numero, cvv, new ExpiryDate(mes, ano)));
        return postWithConfig(client::criarPaymentToken, request, unidadeId);
    }

    public Uni<JsonNode> venderAVistaComCartao(Long unidadeId, String merchantTransactionId, String valor,
                                               String numero, String cvv, String mes, String ano) {
        return getConfig(unidadeId).flatMap(config -> {
            var amount = new TransactionAmount(valor, config.currency());
            var card = new PaymentCard(numero, cvv, new ExpiryDate(mes, ano));
            return postWithConfig(client::criarPagamento, SaleRequest.comCartao(merchantTransactionId, amount, card), unidadeId);
        });
    }

    public Uni<JsonNode> venderAVistaComToken(Long unidadeId, String merchantTransactionId, String valor, String paymentToken) {
        return getConfig(unidadeId).flatMap(config -> {
            var amount = new TransactionAmount(valor, config.currency());
            return postWithConfig(client::criarPagamento, SaleRequest.comToken(merchantTransactionId, amount, paymentToken), unidadeId);
        });
    }

    public Uni<JsonNode> venderParceladoComCartao(Long unidadeId, String invoiceNumber, int numeroDeParcelas,
                                                  String valorParcela, String numero, String cvv, String mes, String ano) {
        return getConfig(unidadeId).flatMap(config -> {
            var amount = new TransactionAmount(valorParcela, config.currency());
            var card = new PaymentCard(numero, cvv, new ExpiryDate(mes, ano));
            var request = ScheduleRequest.comCartao(hoje(), numeroDeParcelas, invoiceNumber, amount, card);
            return postWithConfig(client::criarPaymentSchedule, request, unidadeId);
        });
    }

    public Uni<JsonNode> venderParceladoComToken(Long unidadeId, String invoiceNumber, int numeroDeParcelas,
                                                 String valorParcela, String paymentToken) {
        return getConfig(unidadeId).flatMap(config -> {
            var amount = new TransactionAmount(valorParcela, config.currency());
            var request = ScheduleRequest.comToken(hoje(), numeroDeParcelas, invoiceNumber, amount, paymentToken);
            return postWithConfig(client::criarPaymentSchedule, request, unidadeId);
        });
    }

    public Uni<JsonNode> consultarPagamento(Long unidadeId, String ipgTransactionId) {
        return getConfig(unidadeId).flatMap(config -> {
            var headers = signer.headersFor("", config.apiKey(), config.apiSecret());
            return client.consultarPagamento(ipgTransactionId, headers.apiKey(), headers.clientRequestId(),
                    headers.timestamp(), headers.messageSignature());
        });
    }

    public Uni<JsonNode> consultarParcelamento(Long unidadeId, String orderId) {
        return getConfig(unidadeId).flatMap(config -> {
            var headers = signer.headersFor("", config.apiKey(), config.apiSecret());
            return client.consultarPaymentSchedule(orderId, headers.apiKey(), headers.clientRequestId(),
                    headers.timestamp(), headers.messageSignature());
        });
    }

    public Uni<JsonNode> cancelarPagamento(Long unidadeId, String transactionId) {
        return getConfig(unidadeId).flatMap(config ->
                postWithConfig(client::executarTransacaoSecundaria, transactionId,
                        SecondaryTransactionRequest.voidTotal(), unidadeId));
    }

    public Uni<JsonNode> estornarPagamento(Long unidadeId, String transactionId, String valor) {
        return getConfig(unidadeId).flatMap(config ->
                postWithConfig(client::executarTransacaoSecundaria, transactionId,
                        SecondaryTransactionRequest.returnValor(valor, config.currency()), unidadeId));
    }

    // --------------- Metodos sem unidadeId (fallback para properties) ---------------

    public Uni<JsonNode> tokenizarCartao(String numero, String cvv, String mes, String ano) {
        return tokenizarCartao(null, numero, cvv, mes, ano);
    }

    public Uni<JsonNode> venderAVistaComCartao(String merchantTransactionId, String valor,
                                               String numero, String cvv, String mes, String ano) {
        return venderAVistaComCartao(null, merchantTransactionId, valor, numero, cvv, mes, ano);
    }

    public Uni<JsonNode> venderAVistaComToken(String merchantTransactionId, String valor, String paymentToken) {
        return venderAVistaComToken(null, merchantTransactionId, valor, paymentToken);
    }

    public Uni<JsonNode> venderParceladoComCartao(String invoiceNumber, int numeroDeParcelas, String valorParcela,
                                                  String numero, String cvv, String mes, String ano) {
        return venderParceladoComCartao(null, invoiceNumber, numeroDeParcelas, valorParcela, numero, cvv, mes, ano);
    }

    public Uni<JsonNode> venderParceladoComToken(String invoiceNumber, int numeroDeParcelas, String valorParcela,
                                                 String paymentToken) {
        return venderParceladoComToken(null, invoiceNumber, numeroDeParcelas, valorParcela, paymentToken);
    }

    public Uni<JsonNode> consultarPagamento(String ipgTransactionId) {
        return consultarPagamento(null, ipgTransactionId);
    }

    public Uni<JsonNode> consultarParcelamento(String orderId) {
        return consultarParcelamento(null, orderId);
    }

    public Uni<JsonNode> cancelarPagamento(String transactionId) {
        return cancelarPagamento(null, transactionId);
    }

    public Uni<JsonNode> estornarPagamento(String transactionId, String valor) {
        return estornarPagamento(null, transactionId, valor);
    }

    // --------------- Helpers ---------------

    /**
     * Busca configuracao da Fiserv para a unidade. Se unidadeId for null ou nao encontrar
     * no DB, retorna fallback das properties estaticas.
     */
    private Uni<FiservConfig> getConfig(Long unidadeId) {
        if (unidadeId == null) {
            return Uni.createFrom().item(new FiservConfig(
                    properties.apiKey(), properties.apiSecret(), properties.currency()));
        }
        return finBancoConfig.getConfiguracao(unidadeId, "FISERV").map(config -> {
            String apiKey = config.getOrDefault("api-key", properties.apiKey());
            String apiSecret = config.getOrDefault("api-secret", properties.apiSecret());
            String currency = config.getOrDefault("currency", properties.currency());
            return new FiservConfig(apiKey, apiSecret, currency);
        });
    }

    private record FiservConfig(String apiKey, String apiSecret, String currency) {}

    @FunctionalInterface
    private interface Post {
        Uni<JsonNode> call(String apiKey, String clientRequestId, String timestamp, String signature, String body);
    }

    @FunctionalInterface
    private interface PostWithId {
        Uni<JsonNode> call(String transactionId, String apiKey, String clientRequestId, String timestamp, String signature, String body);
    }

    private Uni<JsonNode> postWithConfig(Post call, Object requestDto, Long unidadeId) {
        return getConfig(unidadeId).flatMap(config -> {
            try {
                String body = mapper.writeValueAsString(requestDto);
                var headers = signer.headersFor(body, config.apiKey(), config.apiSecret());
                return call.call(headers.apiKey(), headers.clientRequestId(), headers.timestamp(), headers.messageSignature(), body);
            } catch (Exception exception) {
                return Uni.createFrom().failure(new IllegalStateException("Falha ao montar requisicao Fiserv", exception));
            }
        });
    }

    private Uni<JsonNode> postWithConfig(PostWithId call, String transactionId, Object requestDto, Long unidadeId) {
        return getConfig(unidadeId).flatMap(config -> {
            try {
                String body = mapper.writeValueAsString(requestDto);
                var headers = signer.headersFor(body, config.apiKey(), config.apiSecret());
                return call.call(transactionId, headers.apiKey(), headers.clientRequestId(),
                        headers.timestamp(), headers.messageSignature(), body);
            } catch (Exception exception) {
                return Uni.createFrom().failure(new IllegalStateException("Falha ao montar requisicao Fiserv", exception));
            }
        });
    }

    private String hoje() {
        return LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
    }
}
