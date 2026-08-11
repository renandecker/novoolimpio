package br.com.sol7.olimpio.financeiro.diapagamento;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_dia_pagamento")
public class DiaPagamento extends PanacheEntity {

    @Column(name = "dia")
    public int dia;
}
