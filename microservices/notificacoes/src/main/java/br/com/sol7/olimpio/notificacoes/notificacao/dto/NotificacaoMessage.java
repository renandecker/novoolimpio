package br.com.sol7.olimpio.notificacoes.notificacao.dto;

/**
 * Mensagem trafegada no Kafka no fluxo de envio por canal.
 * Serializada como JSON (String) nos topicos olimpio.notificacao.{email,mobile,web}.
 */
public record NotificacaoMessage(
        Long id,
        String username,
        String titulo,
        String mensagem,
        String tipo,
        String link,
        boolean canalSistema,
        boolean canalMobile,
        boolean canalEmail) {}
