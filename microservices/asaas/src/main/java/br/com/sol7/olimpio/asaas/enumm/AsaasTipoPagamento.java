package br.com.sol7.olimpio.asaas.enumm;

/**
 * Forma de pagamento de uma cobrança no Asaas (campo billingType da API v3/payments).
 * Espelha a enum legada br.com.sol7.olimpio.enumm.AsaasTipoPagamento.
 */
public enum AsaasTipoPagamento {
    BOLETO,
    CREDIT_CARD,
    PIX,
    UNDEFINED,
    DEPOSIT,
    TRANSFER,
    DEBIT_CARD,
    BALANCE_PAYMENT
}
