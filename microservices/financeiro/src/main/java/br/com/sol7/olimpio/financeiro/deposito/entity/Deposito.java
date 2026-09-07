package br.com.sol7.olimpio.financeiro.deposito.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.util.Date;

// Migrado de br.com.sol7.olimpio.model.entity.financeiro.Deposito (legado)
@Entity
@Table(name = "fin_deposito")
public class Deposito extends PanacheEntity {

    @Column(name = "id_movimentacao")
    public Long movimentacaoId;  // referencia a MovimentacaoFinanceira (id, mesmo servico)
    @Temporal(TemporalType.DATE)
    @Column(name = "data_pagamento")
    public Date data;
    @Column(name = "agencia_destino")
    public String agenciaDestino;
    @Column(name = "conta_destino")
    public String contaDestino;
}
