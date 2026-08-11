package br.com.sol7.olimpio.basico.resultado.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_resultado")
public class Resultado extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "venda")
    public boolean venda;
}
