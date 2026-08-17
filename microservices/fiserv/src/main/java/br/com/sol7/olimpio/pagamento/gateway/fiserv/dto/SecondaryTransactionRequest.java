package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/**
 * POST /ipp/payments-gateway/v2/payments/{transaction-id} (ou /orders/{order-id}) - transacao
 * secundaria da Fiserv (void/cancelamento ou return/estorno de uma transacao primaria anterior).
 * requestType = VoidTransaction (cancela o total) ou ReturnTransaction (estorna um valor).
 */
public record SecondaryTransactionRequest(
        String requestType,
        TransactionAmount transactionAmount) {

    public static SecondaryTransactionRequest voidTotal() {
        return new SecondaryTransactionRequest("VoidTransaction", null);
    }

    public static SecondaryTransactionRequest returnValor(String total, String currency) {
        return new SecondaryTransactionRequest("ReturnTransaction", new TransactionAmount(total, currency));
    }
}
