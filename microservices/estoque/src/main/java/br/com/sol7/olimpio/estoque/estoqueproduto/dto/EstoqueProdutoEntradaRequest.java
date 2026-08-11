package br.com.sol7.olimpio.estoque.estoqueproduto;

import java.math.BigDecimal;

public record EstoqueProdutoEntradaRequest(BigDecimal valor, int quantidade, Long usuarioId, Long produtoId, Long unidadeId, Long fornecedorId) {}
