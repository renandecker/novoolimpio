package br.com.sol7.olimpio.estoque.estoqueproduto;

import java.math.BigDecimal;

public record ContadoresEstoqueResponse(long solicitado,long naoEncontrado,long falta,long defeito,long reservado,long aprovadoNaoEntregue){}
