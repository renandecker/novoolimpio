package br.com.sol7.olimpio.pagamento.gateway.fiserv.dto;

public record CreateTokenOptions(boolean reusable, boolean declineDuplicates) {
    public static CreateTokenOptions reusavelUnico() {
        return new CreateTokenOptions(true, false);
    }
}
