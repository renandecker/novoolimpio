package br.com.sol7.olimpio.financeiro.contacorrente;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_conta_corrente")
public class ContaCorrente extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
