package br.com.sol7.olimpio.basico.genero.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_genero")
public class Genero extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
}
