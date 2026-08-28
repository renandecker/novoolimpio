package br.com.sol7.olimpio.comercial.controleprospecto;

import java.util.List;

// Corpo da requisicao de salvar / salvarSelecionados
public record AjustarProspectoRequest(
        Long id,
        String nome,
        String outro,
        List<Long> selectedIds
) {
}
