package br.com.sol7.olimpio.financeiro.boleto.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

// Migrado de br.com.sol7.olimpio.model.entity.financeiro.Boleto (legado)
@Entity
@Table(name = "fin_boleto")
public class Boleto extends PanacheEntity {

    @Column(name = "id_movimentacao")
    public Long movimentacaoId;  // referencia a MovimentacaoFinanceira (id, mesmo servico)
    @Column(name = "barCode", columnDefinition = "text")
    public String barCode;
}
