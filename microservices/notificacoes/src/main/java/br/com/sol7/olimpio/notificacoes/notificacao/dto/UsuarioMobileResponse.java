package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.time.OffsetDateTime;

public record UsuarioMobileResponse(
        Long id,
        Integer idUsuario,
        String token,
        String plataforma,
        boolean ativo,
        OffsetDateTime ultimoUso,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}