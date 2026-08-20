package br.com.sol7.olimpio.pagamento.parcelacartao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Registro de uma transacao de cartao (a vista ou parcelada) efetuada via Fiserv, vinculada a
 * fin_parcela.id_parcela_cartao (o mesmo papel que fin_parcela_boleto/fin_parcela_pix cumprem
 * para boleto/pix).
 */
@Entity
@Table(name = "fin_parcela_cartao")
public class ParcelaCartao extends PanacheEntityBase {

    public static final String TIPO_VISTA = "VISTA";
    public static final String TIPO_PARCELADO = "PARCELADO";

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "fin_parcela_cartao_seq")
    @SequenceGenerator(name = "fin_parcela_cartao_seq", sequenceName = "fin_parcela_cartao_id_seq", allocationSize = 1)
    public Long id;

    @Column(name = "id_cartao_pessoa")
    public Long idCartaoPessoa;

    @Column(name = "tipo_pagamento", nullable = false)
    public String tipoPagamento;

    @Column(name = "qtd_parcelas", nullable = false)
    public int qtdParcelas = 1;

    @Column(name = "valor", nullable = false)
    public BigDecimal valor;

    @Column(name = "moeda", nullable = false)
    public String moeda = "BRL";

    @Column(name = "merchant_transaction_id")
    public String merchantTransactionId;

    @Column(name = "ipg_transaction_id")
    public String ipgTransactionId;

    @Column(name = "order_id")
    public String orderId;

    @Column(name = "payment_schedule_id")
    public String paymentScheduleId;

    @Column(name = "status")
    public String status;

    @Column(name = "codigo_autorizacao")
    public String codigoAutorizacao;

    @Column(name = "mensagem_retorno", columnDefinition = "text")
    public String mensagemRetorno;

    @Column(name = "fl_ativo")
    public boolean ativo = true;

    @Column(name = "data_transacao")
    public LocalDateTime dataTransacao = LocalDateTime.now();

    @Column(name = "data_cancelamento")
    public LocalDateTime dataCancelamento;
}
