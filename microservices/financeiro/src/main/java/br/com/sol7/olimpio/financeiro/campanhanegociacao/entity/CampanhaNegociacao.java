package br.com.sol7.olimpio.financeiro.campanhanegociacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_campanha_negociacao")
public class CampanhaNegociacao extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "dia_pagamento_antecipado")
    public Integer diaPagamentoAntecipado;
    @Column(name = "dias_para_vencer")
    public Integer diasParaVencer;
    @Column(name = "dia")
    public Integer dia;
    @Column(name = "mes")
    public Integer mes;
    @Column(name = "parcela")
    public Integer parcela;
    @Column(name = "ano")
    public Integer ano;
    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "percentual")
    public BigDecimal percentual;
    @Column(name = "fl_ativo")
    public boolean ativo;
    @Column(name = "data_fim")
    public Date dataFim;
}
