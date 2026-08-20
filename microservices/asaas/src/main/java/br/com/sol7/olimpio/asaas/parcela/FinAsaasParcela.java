package br.com.sol7.olimpio.asaas.parcela;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Espelho local de uma cobrança criada no Asaas (tabela fin_asaas_parcela).
 * Mantem o que interessa para o app (boleto/PIX, status, valores) sem depender
 * de consultar a API do Asaas a cada tela.
 */
@Entity
@Table(name = "fin_asaas_parcela")
public class FinAsaasParcela extends PanacheEntity {

    @Column(name = "billing_type")
    public String billingType;

    @Column(name = "data_criacao")
    public LocalDateTime dataCriacao;

    @Column(name = "payment_date")
    public LocalDate paymentDate;

    @Column(name = "value")
    public Double value;

    @Column(name = "installment")
    public String installment;

    @Column(name = "asaas_id")
    public String asaasId;

    @Column(name = "status")
    public String status;

    @Column(name = "url")
    public String url;

    @Column(name = "url_pagamento")
    public String urlPagamento;

    @Column(name = "description")
    public String description;

    @Column(name = "installmentnumber")
    public Integer installmentNumber;

    @Column(name = "discount")
    public Double discount;

    @Column(name = "fine")
    public Double fine;

    @Column(name = "interest")
    public Double interest;

    @Column(name = "discount_type")
    public String discountType;

    @Column(name = "fine_type")
    public String fineType;

    @Column(name = "interest_type")
    public String interestType;

    @Column(name = "qrcodeimage")
    public String qrCodeImage;

    @Column(name = "keypix")
    public String keyPix;

    @Column(name = "fl_ativo")
    public Boolean flAtivo = true;

    @Column(name = "payload")
    public String payload;
}
