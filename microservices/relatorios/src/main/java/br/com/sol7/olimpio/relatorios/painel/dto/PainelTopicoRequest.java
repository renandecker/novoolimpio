package br.com.sol7.olimpio.relatorios.painel.dto;

import jakarta.validation.constraints.NotNull;

public record PainelTopicoRequest(
    @NotNull Long painelId,
    Long tabelaId,
    Long graficoId,
    Long mapaId,
    Integer ordem
) {}