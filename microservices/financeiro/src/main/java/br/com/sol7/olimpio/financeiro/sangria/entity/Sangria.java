package br.com.sol7.olimpio.financeiro.sangria.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_sangria")
public class Sangria extends PanacheEntity {

    @Column(name = "id_caixa")
    public Long caixaId;  // referencia a Caixa (id, mesmo servico)
    @Column(name = "data")
    public Date data;
    @Column(name = "valor")
    public BigDecimal valor;
}
