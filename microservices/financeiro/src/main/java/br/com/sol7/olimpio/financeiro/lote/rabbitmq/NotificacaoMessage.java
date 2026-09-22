package br.com.sol7.olimpio.financeiro.lote.rabbitmq;

/**
 * Cópia compatível (mesmo JSON) de {@code NotificacaoMessage} do
 * notificacoes-service, trafegada nos exchanges
 * {@code olimpio.notificacao.{email,mobile,web}}.
 *
 * <p>Os fluxos de lote de cobrança publicam aqui: e-mail entrega no
 * {@code destinatario} direto (e-mail do contrato); push mobile/web entrega no
 * {@code username} quando o responsável/aluno possui login.
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
        boolean canalEmail,
        String destinatario) {
}