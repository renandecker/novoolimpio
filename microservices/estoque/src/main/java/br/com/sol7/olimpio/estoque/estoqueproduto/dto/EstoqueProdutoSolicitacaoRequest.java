package br.com.sol7.olimpio.estoque.estoqueproduto;

import br.com.sol7.olimpio.shared.enums.Motivo;

import java.math.BigDecimal;

public record EstoqueProdutoSolicitacaoRequest(BigDecimal valor,int quantidade,Long usuarioId,Long produtoId,Long unidadeId,Long vendaProdutoId,Motivo motivo){}
