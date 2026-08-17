package br.com.sol7.olimpio.asaas.pagamento_pix.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Evento publicado no topico olimpio.pagamento.confirmado quando um pagamento e confirmado.
 * Fluxo PIX movido do fiserv para o asaas-service. O formato e JSON serializado
 * (StringSerializer).
 *
 * @param idParcela      id da fin_parcela vinculada ao pagamento
 * @param idTransacao    id da fin_parcela_pix
 * @param idPessoa       responsavel pelo pagamento (fin_parcela.id_pessoa)
 * @param formaPagamento forma de pagamento (ex.: PIX)
 * @param status         status do pagamento na origem (ex.: PAGO)
 * @param valor          valor do pagamento
 * @param idGateway      identificador no gateway (providerChargeId no PSP PIX)
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
