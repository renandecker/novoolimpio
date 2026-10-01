package br.com.sol7.olimpio.schedule.financeiro;

import java.math.BigDecimal;

/**
 * E-mail de fechamento de caixa publicado no tópico
 * {@code olimpio.financeiro.email-manual} (um por caixa fechado), seguindo a regra
 * portada do legado ({@code SchedulingService.fechamentoCaixaAbertos} +
 * {@code CaixaService.textoEmailCaixa} do extracted_aceso): destinatário =
 * {@code fin_configuracao_caixa.email} do usuário/unidade, com fallback para o e-mail
 * da unidade; assunto e corpo HTML montados com totais de entradas/saídas/sangria.
 *
 * <p>Quem entrega é o notificacoes-service (dono do domínio de e-mail), que consome
 * esse tópico e envia via SMTP. Formato: JSON serializado (StringSerializer).
 */
public record FechamentoCaixaEmailEvent(
        String tipo,
        Long caixaId,
        Long unidadeId,
        String destinatario,
        String assunto,
        String corpoHtml,
        BigDecimal entradas,
        BigDecimal saidas,
        BigDecimal sangria) {

    public static final String TIPO_FECHAMENTO_CAIXA = "FECHAMENTO_CAIXA";
}
