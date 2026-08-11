package br.com.sol7.olimpio.basico.auditoriahistorico.dto;

public record AuditoriaHistoricoResponse(Long id, String nome, String sql, String sqlData, String sqlTipo, String sqlUnidade, String sqlUsuario) {}
