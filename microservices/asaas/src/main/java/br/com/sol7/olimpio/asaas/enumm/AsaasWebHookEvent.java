package br.com.sol7.olimpio.asaas.enumm;

/**
 * Eventos de webhook que o Asaas pode notificar (campo event do payload).
 * Espelha a enum legada br.com.sol7.olimpio.enumm.AsaasWebHookEvent.
 */
public enum AsaasWebHookEvent {
    PAYMENT_CREATED,
    PAYMENT_UPDATED,
    PAYMENT_CONFIRMED,
    PAYMENT_RECEIVED,
    PAYMENT_OVERDUE,
    PAYMENT_REFUNDED,
    PAYMENT_RESTORED,
    PAYMENT_DELETED,
    PAYMENT_ANTICIPATED,
    PAYMENT_DUNNING_REQUESTED,
    PAYMENT_DUNNING_RECEIVED,
    PAYMENT_DUNNING_RECOVERED,
    PAYMENT_BANK_SLIP_VIEWED,
    PAYMENT_CHECKOUT_VIEWED,
    PAYMENT_CREDIT_CARD_CAPTURE_REFUSED
}
