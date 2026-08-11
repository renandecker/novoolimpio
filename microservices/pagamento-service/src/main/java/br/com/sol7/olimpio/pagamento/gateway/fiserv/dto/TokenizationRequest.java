package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/** POST /ipp/payments-gateway/v2/payment-tokens - cadastro de cartao (sem cobranca). */
public record TokenizationRequest(
        String requestType,
        PaymentCard paymentCard,
        CreateTokenOptions createToken,
        boolean accountVerification) {

    public static TokenizationRequest of(PaymentCard card) {
        return new TokenizationRequest("PaymentCardPaymentTokenizationRequest", card, CreateTokenOptions.reusavelUnico(), false);
    }
}
