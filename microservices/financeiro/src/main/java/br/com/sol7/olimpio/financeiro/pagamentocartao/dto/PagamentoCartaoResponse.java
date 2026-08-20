package br.com.sol7.olimpio.financeiro.pagamentocartao.dto;

import br.com.sol7.olimpio.financeiro.pagamentocartao.entity.PagamentoCartao;
import br.com.sol7.olimpio.financeiro.pagamentocartao.entity.TipoPagamentoCartao;

public record PagamentoCartaoResponse(Long id,Long movimentacaoId,TipoPagamentoCartao tipoPagamentoCartao,Integer quantidadeParcelas,Long bandeiraId){}
