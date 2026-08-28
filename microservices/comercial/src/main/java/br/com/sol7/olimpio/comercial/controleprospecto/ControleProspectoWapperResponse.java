package br.com.sol7.olimpio.comercial.controleprospecto;

// Correspondente ao ControleProspectoWapper do legado (wapper/central/ControleProspectoWapper.java)
public record ControleProspectoWapperResponse(
        Long id,
        String nome,
        String valor,
        String outro,
        String unidadeSucinto,
        Double nota
) {
    public ControleProspectoWapperResponse {
        if (id == null) id = 0L;
        if (nome == null) nome = "";
        if (valor == null) valor = "";
        if (outro == null) outro = "";
    }
}
