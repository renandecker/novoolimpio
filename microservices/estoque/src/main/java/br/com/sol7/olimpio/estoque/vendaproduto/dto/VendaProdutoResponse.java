package br.com.sol7.olimpio.estoque.vendaproduto;

import java.math.BigDecimal;
import java.util.Date;

public record VendaProdutoResponse(Long id, Date dataCompra, Long unidadeId, Long usuarioId, Long pessoaId, String tipoFormaPagamento, BigDecimal valor, Long formaPagamentoId, int quantidade) {}
