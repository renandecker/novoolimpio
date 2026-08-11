package br.com.sol7.olimpio.pagamento.pix.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Cobranca PIX de uma parcela - tabela legada (fin_parcela_pix, criada em V1__base.sql),
 * ja vinculada a fin_parcela.id_parcela_pix. Nenhuma alteracao de schema foi necessaria.
 *
 * IMPORTANTE: a collection Fiserv fornecida (Commerce Hub / Payments Gateway) NAO possui um
 * endpoint nativo de PIX (busca na collection nao encontrou nenhuma ocorrencia de "pix"; e uma
 * API global, e PIX e um meio de pagamento instantaneo brasileiro). Este modulo gera/consulta o
 * registro da cobranca localmente e deixa um ponto de extensao (PixProviderClient) pronto para
 * ser plugado a um PSP real (ex.: Asaas, ja referenciado em fin_parcela_pix.id_asaas, ou uma
 * futura API Fiserv Brasil) sem precisar alterar o schema novamente.
 *
 * As colunas valor/valorPago/providerChargeId/endToEndId/dataCriacao/dataPagamento foram
 * adicionadas em V3__ajuste_pix.sql - a tabela original (V1__base.sql) nao tinha nem o valor
 * da cobranca nem um identificador de PSP generico (so id_asaas, especifico do Asaas).
 */
@Entity
@Table(name = "fin_parcela_pix")
public class ParcelaPix extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "fin_parcela_pix_seq")
    @SequenceGenerator(name = "fin_parcela_pix_seq", sequenceName = "fin_parcela_pix_id_seq", allocationSize = 1)
    public Long id;

    @Column(name = "qrcode")
    public String qrcode;

    @Column(name = "key")
    public String chave;

    @Column(name = "id_asaas")
    public Long idAsaas;

    @Column(name = "fl_ativo")
    public boolean ativo = true;

    @Column(name = "data_vencimento")
    public LocalDate dataVencimento;

    @Column(name = "situacao")
    public String situacao;

    @Column(name = "valor")
    public BigDecimal valor;

    @Column(name = "valor_pago")
    public BigDecimal valorPago;

    @Column(name = "moeda")
    public String moeda = "BRL";

    /** Identificador da cobranca no PSP plugado via PixProviderClient (generico, qualquer provedor). */
    @Column(name = "provider_charge_id")
    public String providerChargeId;

    /** Comprovante oficial do Banco Central, disponivel apos a confirmacao do pagamento. */
    @Column(name = "end_to_end_id")
    public String endToEndId;

    @Column(name = "data_criacao")
    public LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_pagamento")
    public LocalDateTime dataPagamento;
}
