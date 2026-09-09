package br.com.sol7.olimpio.relatorios.medida.dto;

public record MedidaResponse(Long id, String tipo, String tipoInfo, String nomeVisualizacao, Long estruturaColunaId, Long estruturaId) {}