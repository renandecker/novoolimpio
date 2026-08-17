package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/** Corpo "transactionAmount" usado em todos os request types de pagamento da Fiserv. */
public record TransactionAmount(String total, String currency) {}
