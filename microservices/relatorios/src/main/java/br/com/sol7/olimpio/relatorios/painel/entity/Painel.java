package br.com.sol7.olimpio.relatorios.painel;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "rel_painel")
public class Painel extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
}
