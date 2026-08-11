package br.com.sol7.olimpio.asaas.enumm;

/**
 * Status de uma cobrança/parcela no Asaas (campo status da API v3/payments).
 * Espelha a enum legada br.com.sol7.olimpio.enumm.AsaasStatusParcela.
 */
public enum AsaasStatusParcela {
    PENDING,
    RECEIVED,
    CONFIRMED,
    OVERDUE,
    REFUNDED,
    RECEIVED_IN_CASH,
    REFUND_REQUESTED,
    REFUND_IN_PROGRESS,
    CHARGEBACK_REQUESTED,
    CHARGEBACK_DISPUTE,
    AWAITING_CHARGEBACK_REVERSAL,
    DUMPED_REQUESTED,
    DUMPED_RECEIVED,
    DUMPED_RECOVERED,
    PARTIALLY_RECEIVED,
    BANK_SLIP_REQUESTED,
    BANK_SLIP_VIEWED,
    CHECKOUT_VIEWED,
    CANCELLED,
    DELETED,
    EXPIRED
}
