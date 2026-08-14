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
import org.eclipse.microprofile.rest.client.inject.RestClient;

/**
 * Ponto unico de integracao com a Fiserv Commerce Hub / Payments Gateway (IPP).
 *
 * As respostas da Fiserv sao devolvidas como {@link JsonNode} (e nao DTOs fortemente tipados):
 * a API e "polimorfica" (mesmo endpoint /payments aceita e retorna formatos diferentes
 * conforme o requestType) e a collection fornecida nao documenta um schema de resposta unico
 * para cada requestType. Os campos relevantes (ipgTransactionId, orderId, transactionStatus,
 * paymentMethodDetails.paymentCard.bin/last4/brand, paymentToken.value) sao extraidos pelos
 * services de dominio (ver ParcelaCartaoService / CartaoPessoaService).
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
    ObjectMapper mapper;

    /** Tokeniza um cartao (cadastro), sem realizar cobranca. Usado por CartaoPessoaService. */
    public Uni<JsonNode> tokenizarCartao(String numero, String cvv, String mes, String ano) {
        var request = TokenizationRequest.of(new PaymentCard(numero, cvv, new ExpiryDate(mes, ano)));
        return post(client::criarPaymentToken, request);
    }

    /** Venda a vista (uma unica cobranca) usando os dados "crus" do cartao. */
    public Uni<JsonNode> venderAVistaComCartao(String merchantTransactionId, String valor,
                                                String numero, String cvv, String mes, String ano) {
        var amount = new TransactionAmount(valor, properties.currency());
        var card = new PaymentCard(numero, cvv, new ExpiryDate(mes, ano));
        return post(client::criarPagamento, SaleRequest.comCartao(merchantTransactionId, amount, card));
    }

    /** Venda a vista (uma unica cobranca) usando um paymentToken previamente cadastrado (fin_cartao_pessoa). */
    public Uni<JsonNode> venderAVistaComToken(String merchantTransactionId, String valor, String paymentToken) {
        var amount = new TransactionAmount(valor, properties.currency());
        return post(client::criarPagamento, SaleRequest.comToken(merchantTransactionId, amount, paymentToken));
    }

    /** Venda parcelada (payment schedule) usando os dados "crus" do cartao. valorParcela = valor de CADA parcela. */
    public Uni<JsonNode> venderParceladoComCartao(String invoiceNumber, int numeroDeParcelas, String valorParcela,
                                                   String numero, String cvv, String mes, String ano) {
        var amount = new TransactionAmount(valorParcela, properties.currency());
        var card = new PaymentCard(numero, cvv, new ExpiryDate(mes, ano));
        var request = ScheduleRequest.comCartao(hoje(), numeroDeParcelas, invoiceNumber, amount, card);
        return post(client::criarPaymentSchedule, request);
    }

    /** Venda parcelada (payment schedule) usando um paymentToken previamente cadastrado. */
    public Uni<JsonNode> venderParceladoComToken(String invoiceNumber, int numeroDeParcelas, String valorParcela,
                                                  String paymentToken) {
        var amount = new TransactionAmount(valorParcela, properties.currency());
        var request = ScheduleRequest.comToken(hoje(), numeroDeParcelas, invoiceNumber, amount, paymentToken);
        return post(client::criarPaymentSchedule, request);
    }

    public Uni<JsonNode> consultarPagamento(String ipgTransactionId) {
        var headers = signer.headersFor("");
        return client.consultarPagamento(ipgTransactionId, headers.apiKey(), headers.clientRequestId(),
                headers.timestamp(), headers.messageSignature());
    }

    public Uni<JsonNode> consultarParcelamento(String orderId) {
        var headers = signer.headersFor("");
        return client.consultarPaymentSchedule(orderId, headers.apiKey(), headers.clientRequestId(),
                headers.timestamp(), headers.messageSignature());
    }

    /** Cancela (void) uma transacao primaria do mesmo dia pelo ipgTransactionId. */
    public Uni<JsonNode> cancelarPagamento(String transactionId) {
        return post(client::executarTransacaoSecundaria, transactionId, SecondaryTransactionRequest.voidTotal());
    }

    /** Estorna (return) uma transacao primaria ja liquidada pelo ipgTransactionId. */
    public Uni<JsonNode> estornarPagamento(String transactionId, String valor) {
        return post(client::executarTransacaoSecundaria, transactionId,
                SecondaryTransactionRequest.returnValor(valor, properties.currency()));
    }

    // -----------------------------------------------------------------------------------------

    @FunctionalInterface
    private interface Post {
        Uni<JsonNode> call(String apiKey, String clientRequestId, String timestamp, String signature, String body);
    }

    @FunctionalInterface
    private interface PostWithId {
        Uni<JsonNode> call(String transactionId, String apiKey, String clientRequestId, String timestamp, String signature, String body);
    }

    private Uni<JsonNode> post(Post call, Object requestDto) {
        try {
            String body = mapper.writeValueAsString(requestDto);
            var headers = signer.headersFor(body);
            return call.call(headers.apiKey(), headers.clientRequestId(), headers.timestamp(), headers.messageSignature(), body);
        } catch (Exception exception) {
            return Uni.createFrom().failure(new IllegalStateException("Falha ao montar requisicao Fiserv", exception));
        }
    }

    private Uni<JsonNode> post(PostWithId call, String transactionId, Object requestDto) {
        try {
            String body = mapper.writeValueAsString(requestDto);
            var headers = signer.headersFor(body);
            return call.call(transactionId, headers.apiKey(), headers.clientRequestId(),
                    headers.timestamp(), headers.messageSignature(), body);
        } catch (Exception exception) {
            return Uni.createFrom().failure(new IllegalStateException("Falha ao montar requisicao Fiserv", exception));
        }
    }

    private String hoje() {
        return LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
    }
}
