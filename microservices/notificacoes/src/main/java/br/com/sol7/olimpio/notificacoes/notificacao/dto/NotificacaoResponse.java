package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.time.OffsetDateTime;

public record NotificacaoResponse(
        Long id,
        String username,
        String titulo,
        String mensagem,
        String tipo,
        String link,
        boolean lida,
        boolean canalSistema,
        boolean canalMobile,
        boolean canalEmail,
        boolean emailEnviado,
        boolean mobileEnviado,
        OffsetDateTime dataLeitura,
        OffsetDateTime createdAt) {}
