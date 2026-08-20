package br.com.sol7.olimpio.financeiro.cheque.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

// Migrado de br.com.sol7.olimpio.model.entity.financeiro.Cheque (legado)
@Entity
@Table(name = "fin_cheque")
public class Cheque extends PanacheEntity {

    @Column(name = "id_movimentacao")
    public Long movimentacaoId;  // referencia a MovimentacaoFinanceira (id, mesmo servico)
    @Column(name = "data")
    public Date data;
    @Column(name = "numero", columnDefinition = "text")
    public String numero;

    public Cheque() {
        this.data = new Date();
        this.numero = "";
    }
}
