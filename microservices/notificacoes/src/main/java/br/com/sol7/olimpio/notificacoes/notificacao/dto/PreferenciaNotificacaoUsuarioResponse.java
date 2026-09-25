package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.time.OffsetDateTime;

public record PreferenciaNotificacaoUsuarioResponse(
        Long id,
        String username,
        String categoria,
        String tipo,
        String canal,
        boolean ativo,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}