package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.time.OffsetDateTime;

public record ConfigCanalResponse(
        Long id,
        String canal,
        boolean ativo,
        String destinatario,
        String descricao,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
