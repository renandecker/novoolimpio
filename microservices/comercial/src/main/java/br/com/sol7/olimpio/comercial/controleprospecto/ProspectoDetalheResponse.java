package br.com.sol7.olimpio.comercial.controleprospecto;

// Campos de um prospecto agrupados por categoria para o dialogo de detalhes
public record ProspectoDetalheResponse(
        Long campoId,
        String rotulo,
        String tipo,
        String categoria,
        String valor
) {
}
