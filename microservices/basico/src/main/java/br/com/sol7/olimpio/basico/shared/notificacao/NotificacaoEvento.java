package br.com.sol7.olimpio.basico.shared.notificacao;

/**
 * Evento generico de notificacao publicado no exchange
 * {@code olimpio.notificacao.generic} e consumido pelo microservico de
 * notificacoes (NotificacaoGenericConsumer), que retorna a chamada generica
 * aplicando config de canais do sistema + preferencias do usuario.
 */
public record NotificacaoEvento(
        String username,
        String categoria,
        String tipo,
        String titulo,
        String mensagem,
        String link,
        Boolean canalMobile,
        Boolean canalEmail,
        Boolean canalTelegram,
        Boolean canalSms,
        Boolean canalWhatsapp,
        Boolean canalNotificacao) {
}
