package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PreferenciaNotificacaoUsuarioRequest(
        @NotBlank @Size(max = 120) String username,
        @NotBlank @Size(max = 30) String categoria,
        @NotBlank @Size(max = 30) String tipo,
        @NotBlank @Size(max = 30) String canal,
        Boolean ativo
) {}