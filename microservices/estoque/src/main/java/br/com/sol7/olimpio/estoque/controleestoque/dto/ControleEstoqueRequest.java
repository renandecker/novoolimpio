package br.com.sol7.olimpio.estoque.controleestoque;

import java.math.BigDecimal;

public record ControleEstoqueRequest(BigDecimal valor,int quantidade,int qtdeSolicitado,int qtdeDefeito,int qtdeFalta,int qtdeNaoEncontrado,int qtdeReservado,int qtdeAprovadoNaoEntregue,Long produtoId,Long unidadeId){}
