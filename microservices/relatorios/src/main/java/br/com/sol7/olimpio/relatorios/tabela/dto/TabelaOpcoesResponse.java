package br.com.sol7.olimpio.relatorios.tabela.dto;

import java.util.List;

public record TabelaOpcoesResponse(List<TabelaCampoResponse> dimensoes, List<TabelaCampoResponse> medidas) {}
