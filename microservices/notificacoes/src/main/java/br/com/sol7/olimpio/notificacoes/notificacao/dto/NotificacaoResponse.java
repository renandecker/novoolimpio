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
        boolean canalTelegram,
        boolean canalSms,
        boolean canalWhatsapp,
        boolean canalNotificacao,
        boolean emailEnviado,
        boolean mobileEnviado,
        boolean telegramEnviado,
        boolean smsEnviado,
        boolean whatsappEnviado,
        boolean notificacaoEnviada,
        OffsetDateTime dataLeitura,
        OffsetDateTime createdAt){}
