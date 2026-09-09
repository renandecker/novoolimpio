package br.com.sol7.olimpio.relatorios.dimensao.dto;

public record DimensaoResponse(Long id, String tipo, String tipoInfo, String nomeVisualizacao, Long estruturaColunaId, Long estruturaId) {}