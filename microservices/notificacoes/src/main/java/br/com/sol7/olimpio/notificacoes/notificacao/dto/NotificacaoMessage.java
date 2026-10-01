package br.com.sol7.olimpio.notificacoes.notificacao.dto;

/**
 * Mensagem trafegada no Kafka no fluxo de envio por canal.
 * Serializada como JSON (String) nos topicos olimpio.notificacao.{email,mobile,web}.
 *
 * @param destinatario e-mail direto do destinatário (usado pelos fluxos de lote de
 *                     cobrança/NAP, que têm o e-mail do contrato mas nem sempre um
 *                     username com login); quando presente, o canal e-mail entrega
 *                     nele sem precisar resolver via bas_login. Nulo nas notificações
 *                     criadas pela API.
 */
public record NotificacaoMessage(
        Long id,
        String username,
        Integer idUsuario,
        String titulo,
        String mensagem,
        String tipo,
        String link,
        boolean canalSistema,
        boolean canalMobile,
        boolean canalEmail,
        boolean canalTelegram,
        boolean canalSms,
        boolean canalWhatsapp,
        boolean canalNotificacao,
        String destinatario){}
