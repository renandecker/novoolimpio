package br.com.sol7.olimpio.relatorios.dimensao.dto;

public record DimensaoRequest(String tipo, String tipoInfo, String nomeVisualizacao, Long estruturaColunaId, Long estruturaId) {}