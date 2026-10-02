package br.com.sol7.olimpio.comercial.prospectoradar;

import java.util.List;

public record AcaoFormularioResponse(Long acaoId, String descricao, Integer qtdeCamposBusca, List<AcaoFormularioCampoResponse> campos) {
}
