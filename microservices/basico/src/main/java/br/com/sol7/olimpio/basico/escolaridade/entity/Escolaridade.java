package br.com.sol7.olimpio.basico.escolaridade.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_escolaridade")
public class Escolaridade extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "ordem")
    public Integer ordem;
}
