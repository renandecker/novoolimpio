package br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_movimentacao")
public class MovimentacaoFinanceira extends PanacheEntity {

    @Column(name = "dt_movimento")
    public Date dataMovimento;
    @Column(name = "historico", columnDefinition = "text")
    public String historico;
    @Column(name = "vencimento", columnDefinition = "text")
    public String vencimento;
    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "documento", columnDefinition = "text")
    public String documento;
    @Column(name = "quantidade")
    public BigDecimal quantidade;
    @Column(name = "especie", columnDefinition = "text")
    public String especie;
    @Column(name = "valor_troco")
    public BigDecimal valorTroco;
    @Column(name = "id_caixa")
    public Long caixaId;  // referencia a Caixa (id, mesmo servico)
    @Column(name = "id_movimento")
    public Long movimentoId;  // referencia a Movimento (id, mesmo servico)
    @Column(name = "id_tipo_historico")
    public Long tipoHistoricoId;  // referencia a TipoHistorico (id, mesmo servico)
    @Column(name = "id_conta_corrente")
    public Long contaCorrenteId;  // referencia a ContaCorrente (id, mesmo servico)
    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", columnDefinition = "text")
    public TipoPagamento tipoPagamento;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_parcela")
    public Long parcelaId;  // referencia a Parcela (id, cross-service - microservico comercial)
    @Column(name = "desconto")
    public BigDecimal desconto;
    @Column(name = "multa_juros")
    public BigDecimal multaJuros;

    public MovimentacaoFinanceira() {
        this.dataMovimento = new Date();
    }
}
