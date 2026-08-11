package br.com.sol7.olimpio.financeiro.bandeira;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_bandeira")
public class Bandeira extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "qtd_parcelas")
    public int quantidadeParcelas;
}
