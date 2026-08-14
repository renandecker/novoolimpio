package br.com.sol7.olimpio.basico.auditoria.dto;

public record AuditoriaRequest(String username, int action, long timestamp) {}
