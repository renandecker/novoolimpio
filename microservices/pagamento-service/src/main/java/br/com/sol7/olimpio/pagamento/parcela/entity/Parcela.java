package br.com.sol7.olimpio.pagamento.parcela.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Mapeamento parcial de fin_parcela (tabela legada, criada em V1__base.sql). Este
 * microsservico so precisa ler/atualizar os campos relacionados a forma de pagamento -
 * as demais colunas (contrato, matricula, etc.) sao de responsabilidade de outros
 * microsservicos (ex.: financeiro/matricula) e por isso nao sao mapeadas aqui.
 */
@Entity
@Table(name = "fin_parcela")
public class Parcela extends PanacheEntityBase {

    @Id
    public Long id;

    @Column(name = "valor")
    public BigDecimal valor;

    @Column(name = "valor_pago")
    public BigDecimal valorPago;

    @Column(name = "data_vencimento")
    public LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    public LocalDateTime dataPagamento;

    @Column(name = "forma_pagamento")
    public String formaPagamento;

    @Column(name = "id_pessoa")
    public Long idPessoa;

    @Column(name = "id_parcela_boleto")
    public Long idParcelaBoleto;

    @Column(name = "id_parcela_pix")
    public Long idParcelaPix;

    @Column(name = "id_parcela_cartao")
    public Long idParcelaCartao;
}
