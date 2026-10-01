package br.com.sol7.olimpio.notificacoes.notificacao.dto;

/**
 * Evento generico publicado pelos demais microservicos no exchange
 * {@code olimpio.notificacao.generic}. O consumer converte para a chamada
 * generica {@code POST /api/notificacoes/notificacao} (NotificacaoService.create),
 * que ja aplica: canais do sistema (not_config_canal) + preferencias do usuario
 * (not_preferencia_notificacao_usuario). Se nenhum canal restar habilitado,
 * a notificacao e persistida sem dispatch.
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
    public NotificacaoRequest toRequest() {
        return new NotificacaoRequest(username, titulo, mensagem, tipo, categoria, link,
                canalMobile, canalEmail, canalTelegram, canalSms, canalWhatsapp, canalNotificacao);
    }
}
