package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/**
 * paymentMethod do request Fiserv. Preencha paymentCard (cartao "cru", uso unico) OU
 * paymentToken (token previamente gerado via /payment-tokens, para cartao ja cadastrado).
 */
public record PaymentMethod(PaymentCard paymentCard,PaymentToken paymentToken){

public static PaymentMethod ofCard(PaymentCard card){
        return new PaymentMethod(card,null);
        }

public static PaymentMethod ofToken(String tokenValue){
        return new PaymentMethod(null,new PaymentToken(tokenValue));
        }

public record PaymentToken(String value){}
        }
