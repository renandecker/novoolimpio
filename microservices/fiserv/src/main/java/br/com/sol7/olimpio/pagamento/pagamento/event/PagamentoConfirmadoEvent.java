package br.com.sol7.olimpio.pagamento.pagamento.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Evento publicado no topico olimpio.pagamento.confirmado quando um pagamento (cartao a vista,
 * cartao parcelado ou PIX) e confirmado. O formato e JSON serializado (StringSerializer).
 *
 * @param idParcela      id da fin_parcela vinculada ao pagamento
 * @param idTransacao    id da fin_parcela_cartao ou fin_parcela_pix
 * @param idPessoa       responsavel pelo pagamento (fin_parcela.id_pessoa)
 * @param formaPagamento CARTAO_VISTA | CARTAO_PARCELADO | PIX
 * @param status         status do pagamento na origem (ex.: APPROVED, PAGO)
 * @param valor          valor do pagamento
 * @param idGateway      identificador no gateway (ipgTransactionId no Fiserv / providerChargeId no PSP PIX)
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
        LocalDateTime dataConfirmacao){
        }
