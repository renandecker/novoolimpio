package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/**
 * POST /ipp/payments-gateway/v2/payments - pagamento com cartao A VISTA (uma unica cobranca).
 * requestType = PaymentCardSaleTransaction (cartao "cru") ou PaymentTokenSaleTransaction (token).
 */
public record SaleRequest(
        String requestType,
        String merchantTransactionId,
        TransactionAmount transactionAmount,
        PaymentMethod paymentMethod){

public static SaleRequest comCartao(String merchantTransactionId,TransactionAmount amount,PaymentCard card){
        return new SaleRequest("PaymentCardSaleTransaction",merchantTransactionId,amount,PaymentMethod.ofCard(card));
        }

public static SaleRequest comToken(String merchantTransactionId,TransactionAmount amount,String tokenValue){
        return new SaleRequest("PaymentTokenSaleTransaction",merchantTransactionId,amount,PaymentMethod.ofToken(tokenValue));
        }
        }
