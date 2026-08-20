package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/**
 * POST /ipp/payments-gateway/v2/payment-schedules - pagamento com cartao PARCELADO.
 * numberOfPayments = quantidade de parcelas; transactionAmount.total = valor de CADA parcela.
 */
public record ScheduleRequest(
        String requestType,
        String startDate,
        int numberOfPayments,
        Integer maximumFailures,
        String invoiceNumber,
        String transactionOrigin,
        Frequency frequency,
        PaymentMethod paymentMethod,
        TransactionAmount transactionAmount){

public static ScheduleRequest comCartao(String startDate,int numberOfPayments,String invoiceNumber,
        TransactionAmount valorDaParcela,PaymentCard card){
        return new ScheduleRequest("PaymentMethodPaymentSchedulesRequest",startDate,numberOfPayments,1,
        invoiceNumber,"ECOM",Frequency.mensal(),PaymentMethod.ofCard(card),valorDaParcela);
        }

public static ScheduleRequest comToken(String startDate,int numberOfPayments,String invoiceNumber,
        TransactionAmount valorDaParcela,String tokenValue){
        return new ScheduleRequest("PaymentMethodPaymentSchedulesRequest",startDate,numberOfPayments,1,
        invoiceNumber,"ECOM",Frequency.mensal(),PaymentMethod.ofToken(tokenValue),valorDaParcela);
        }
        }
