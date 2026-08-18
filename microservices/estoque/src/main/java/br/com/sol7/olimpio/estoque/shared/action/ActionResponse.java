package br.com.sol7.olimpio.estoque.shared.action;

public record ActionResponse(String module, String resource, String action, String status, String payload) {}

