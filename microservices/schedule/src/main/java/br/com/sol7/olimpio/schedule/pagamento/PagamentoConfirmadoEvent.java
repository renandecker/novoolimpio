package br.com.sol7.olimpio.schedule.pagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Evento consumido do tópico {@code olimpio.pagamento.confirmado}, publicado pelo
 * fiserv-service (cartão) e pelo asaas-service (PIX) quando um pagamento é confirmado.
 * Formato: JSON serializado (StringSerializer). Mesmo contrato do
 * {@code PagamentoConfirmadoEvent} dos produtores.
 *
 * @param idParcela       id da fin_parcela vinculada ao pagamento
 * @param idTransacao     id da fin_parcela_cartao ou fin_parcela_pix
 * @param idPessoa        responsável pelo pagamento (fin_parcela.id_pessoa)
 * @param formaPagamento  CARTAO_VISTA | CARTAO_PARCELADO | PIX
 * @param status          status do pagamento na origem (ex.: APPROVED, PAGO)
 * @param valor           valor do pagamento
 * @param idGateway       identificador no gateway (ipgTransactionId no Fiserv / providerChargeId no PSP PIX)
 * @param dataConfirmacao data em que o pagamento foi confirmado
 */
public record PagamentoConfirmadoEvent(
        Long idParcela,
        Long idTransacao,
        Long idPessoa,
        String formaPagamento,
        String status,
        BigDecimal valor,
        String idGateway,
        LocalDateTime dataConfirmacao) {
}
