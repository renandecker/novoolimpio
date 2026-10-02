package br.com.sol7.olimpio.comercial.prospectoradar;

public record AcaoFormularioCampoResponse(
        Long id,
        String rotulo,
        String tipo,
        String maskara,
        Integer tamanho,
        Boolean obrigatorio,
        Integer ordem,
        Boolean permitirHistorico,
        Boolean flagBanco,
        Boolean flagNome
) {
}
