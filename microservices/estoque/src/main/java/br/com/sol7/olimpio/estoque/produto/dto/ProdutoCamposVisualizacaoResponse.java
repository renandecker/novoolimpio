package br.com.sol7.olimpio.estoque.produto;

import java.util.List;
import br.com.sol7.olimpio.estoque.produtocampoinformacao.ProdutoCampoInformacaoResponse;

public record ProdutoCamposVisualizacaoResponse(Long produtoId, List<ProdutoCampoInformacaoResponse> campos) {
}
