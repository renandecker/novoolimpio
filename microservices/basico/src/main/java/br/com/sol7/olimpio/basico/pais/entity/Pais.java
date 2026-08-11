package br.com.sol7.olimpio.basico.pais.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_pais")
public class Pais extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "nacionalidade")
    public String nacionalidade;
}
