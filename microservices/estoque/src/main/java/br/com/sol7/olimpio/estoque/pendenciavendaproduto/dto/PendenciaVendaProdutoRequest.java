package br.com.sol7.olimpio.estoque.pendenciavendaproduto;

import java.util.Date;

public record PendenciaVendaProdutoRequest(int quantidade, Long vendaProdutoId, Long produtoId, Date dataEntrega) {}
