package br.com.sol7.olimpio.relatorios.painel.dto;

import java.util.List;

public record PainelPermissaoRequest(List<Long> usuariosIds, List<Long> unidadesIds, List<Long> perfisIds) {}