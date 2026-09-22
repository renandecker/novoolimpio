package br.com.sol7.olimpio.relatorios.painel.dto;

import java.util.List;

public record PainelResponse(Long id, String nome, List<PainelTopicoResponse> topicos,
                             List<Long> usuariosIds, List<Long> unidadesIds, List<Long> perfisIds,
                             List<Long> filtrosIds) {}