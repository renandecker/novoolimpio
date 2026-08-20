package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

/**
 * Periodicidade das parcelas: every=1, unit=MONTH -> cobranca mensal.
 */
public record Frequency(int every,String unit){
public static Frequency mensal(){
        return new Frequency(1,"MONTH");
        }
        }
