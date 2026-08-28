package br.com.sol7.olimpio.comercial.controleprospecto;

// Prospecto simples exibido no dialogo de "Ajustar prospecto selecionados"
public record ProspectoSimplesResponse(
        Long id,
        String nome,
        String unidadeSucinto,
        String valor
) {
}
