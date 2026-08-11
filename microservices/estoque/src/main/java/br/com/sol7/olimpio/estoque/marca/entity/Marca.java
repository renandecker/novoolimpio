package br.com.sol7.olimpio.estoque.marca;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "est_marca")
public class Marca extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
