package br.com.sol7.olimpio.estoque.controleepedidos;

import java.math.BigDecimal;
import java.util.Date;

public record ControlePedidosResponse(Long id, Date dataEntrega, boolean aprovado, Date dataAprovacao, Date dataPrevisao, BigDecimal valor, int quantidade, Long usuarioId, Long solicitacaoEstoqueId, Long movimentacaoEstoqueId, Long produtoId, Long unidadeId) {}
