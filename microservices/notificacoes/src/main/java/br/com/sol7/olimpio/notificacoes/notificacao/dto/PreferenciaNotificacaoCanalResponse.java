package br.com.sol7.olimpio.notificacoes.notificacao.dto;

public record PreferenciaNotificacaoCanalResponse(
        String canal,
        String canalLabel,
        boolean ativo
) {}