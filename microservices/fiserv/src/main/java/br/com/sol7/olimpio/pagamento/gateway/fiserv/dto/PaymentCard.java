package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/**
 * Dados do cartao usados apenas em memoria, na chamada a Fiserv. NUNCA sao persistidos no
 * banco do microsservico (ver fin_cartao_pessoa, que guarda somente bin/ultimos_digitos/token).
 */
public record PaymentCard(String number, String securityCode, ExpiryDate expiryDate) {}
