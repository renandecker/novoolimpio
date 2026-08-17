package br.com.sol7.olimpio.relatorios.tabela.dto;

import java.util.List;
import java.util.Map;

/** Resultado tabular obtido a partir da configuração SQL da tabela. */
public record TabelaExecutadaResponse(List<String> colunas, List<Map<String, Object>> linhas) {}
