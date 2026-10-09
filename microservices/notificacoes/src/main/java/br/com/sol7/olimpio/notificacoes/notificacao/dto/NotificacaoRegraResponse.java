package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record NotificacaoRegraResponse(
        Long id,
        String nome,
        String descricao,
        String tipoRegra,
        String canal,
        String destinatario,
        boolean destinatarioProfessor,
        Double valorLimite,
        boolean ativo,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}